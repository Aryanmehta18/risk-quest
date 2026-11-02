import { supabase } from "./supabase";
import { teams as seedTeams, rounds as seedRounds } from "../data/teams";
import { rankTeams } from "./rank";
import { questionBank } from "../data/questions";
const GAME_ID = "main";
const DEFAULT_SECONDS = 10 * 60;

// 4 questions per case: Q1 5 min, Q2 15 min, Q3 5 min, Q4 5 min (editable in admin)
export const defaultQuestions = () =>
  [5, 15, 5, 5].map((minutes, i) => ({ id: `q${i + 1}`, minutes, context: "" }));

const secondsFor = (round, idx, fallback = DEFAULT_SECONDS) => {
  const m = Number(round?.questions?.[idx]?.minutes);
  return m > 0 ? Math.round(m * 60) : fallback;
};

const seed = () => {
  const rounds = seedRounds.map((r, i) => ({
    ...r,
    status: i === 0 ? "live" : "upcoming",
    questions: defaultQuestions(),
  }));
  const sec = secondsFor(rounds[0], 0);
  return {
    teams: seedTeams.map((t, i) => ({
      ...t,
      score: 0,
      prevRank: i + 1,
      streak: 0,
      riskLevel: "moderate",
      history: [],
    })),
    rounds,
    events: [
      { id: "e0", type: "info", teamId: null, points: 0, message: "Welcome to Risk Quest", timestamp: 0 },
    ],
    undoStack: [],
    flash: null,
    frozen: false,
    snapshot: null,
    eliminationCount: 0,
    qIndex: 0,
    finale: null,
    focus: { on: false, size: 1 },
    timer: { status: "idle", durationSec: sec, endsAt: 0, remainingMs: sec * 1000 },
  };
};

let state = seed();
let ready = false;
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

function applyRow(row) {
  if (row?.state) state = row.state;
  ready = true;
  notify();
}

/* ---------- Database: load, live sync, save ---------- */

supabase
  .from("game")
  .select("state")
  .eq("id", GAME_ID)
  .maybeSingle()
  .then(({ data, error }) => {
    if (error) console.error("Load failed:", error.message);
    applyRow(data);
  });

supabase
  .channel("game-state")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "game", filter: `id=eq.${GAME_ID}` },
    (payload) => applyRow(payload.new)
  )
  .subscribe();

function commit(next) {
  state = next;
  notify();
  supabase
    .from("game")
    .upsert({ id: GAME_ID, state: next, updated_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error) {
        console.error("Save failed:", error.message);
        alert("Save failed: " + error.message);
      }
    });
}

export async function ensureState() {
  const { data } = await supabase.from("game").select("id").eq("id", GAME_ID).maybeSingle();
  if (!data) {
    const { error } = await supabase.from("game").upsert({ id: GAME_ID, state: seed() });
    if (error) console.error("Create failed:", error.message);
  }
}

export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getState = () => state;
export const getReady = () => ready;

/* ---------- Scores ---------- */

export function addPoints(teamId, points, reason) {
  const team = state.teams.find((t) => t.id === teamId);
  if (!team || team.eliminatedAfter || !points) return;

  const before = rankTeams(state.teams);
  const prevRanks = Object.fromEntries(state.teams.map((t) => [t.id, t.prevRank]));

  const teams = state.teams.map((t) => ({
    ...t,
    prevRank: before.find((r) => r.id === t.id).rank,
    score: t.id === teamId ? t.score + points : t.score,
  }));

  const type = points > 0 ? "score" : "penalty";
  const sign = points > 0 ? "+" : "−";
  const event = {
    id: `e${Date.now()}`,
    type,
    teamId,
    points,
    message: `${team.name} ${sign}${Math.abs(points)} pts${reason ? ` (${reason})` : ""}`,
    timestamp: Date.now(),
  };

  commit({
    ...state,
    teams,
    events: [event, ...state.events].slice(0, 20),
    undoStack: [...state.undoStack, { teamId, points, eventId: event.id, prevRanks }],
       flash: { teamId, type, key: Date.now(), points },
  });
}

export function undoLast() {
  const last = state.undoStack[state.undoStack.length - 1];
  if (!last) return;
  commit({
    ...state,
        teams: state.teams.map((t) => ({
      ...t,
      prevRank: last.prevRanks[t.id],
      score: t.id === last.teamId ? t.score - last.points : t.score,
      trail: t.id === last.teamId ? (t.trail || []).slice(0, -1) : t.trail,
    })),
    events: state.events.filter((e) => e.id !== last.eventId),
    undoStack: state.undoStack.slice(0, -1),
    flash: null,
  });
}

/* ---------- Timer ---------- */

// Override the length of the current question's timer (e.g. give extra time)
export function setDuration(sec) {
  commit({
    ...state,
    timer: { status: "idle", durationSec: sec, endsAt: 0, remainingMs: sec * 1000 },
  });
}

export function startTimer() {
  const t = state.timer;
  const ms = t.remainingMs > 0 ? t.remainingMs : t.durationSec * 1000;
  commit({ ...state, timer: { ...t, status: "running", endsAt: Date.now() + ms, remainingMs: ms } });
}

export function pauseTimer() {
  const t = state.timer;
  if (t.status !== "running") return;
  commit({
    ...state,
    timer: { ...t, status: "paused", remainingMs: Math.max(0, t.endsAt - Date.now()) },
  });
}

/* ---------- Questions inside a case ---------- */

function gotoQuestion(idx) {
  const live = state.rounds.find((r) => r.status === "live");
  if (!live) return;
  const count = live.questions?.length || 0;
  if (idx < 0 || idx > count - 1) return;
  const sec = secondsFor(live, idx, state.timer.durationSec);
  commit({
    ...state,
    qIndex: idx,
    timer: { status: "idle", durationSec: sec, endsAt: 0, remainingMs: sec * 1000 },
  });
}

export const nextQuestion = () => gotoQuestion((state.qIndex || 0) + 1);
export const prevQuestion = () => gotoQuestion((state.qIndex || 0) - 1);

/* ---------- Rounds ---------- */

export function endRound() {
  const idx = state.rounds.findIndex((r) => r.status === "live");
  if (idx === -1) return;

  const rounds = state.rounds.map((r, i) =>
    i === idx ? { ...r, status: "done" } : i === idx + 1 ? { ...r, status: "live" } : r
  );
  // lock this round's scores into the chart history
  const teams = state.teams.map((t) => ({ ...t, history: [...t.history, t.score] }));
  const sec = rounds[idx + 1] ? secondsFor(rounds[idx + 1], 0) : state.timer.durationSec;

  commit({
    ...state,
    rounds,
    teams,
    qIndex: 0,
    focus: { ...(state.focus || { size: 1 }), on: false },
    undoStack: [],
    flash: null,
    timer: { status: "idle", durationSec: sec, endsAt: 0, remainingMs: sec * 1000 },
  });
}

/* ---------- Elimination ---------- */

export function eliminateBottom(count = 2) {
  const done = state.rounds.filter((r) => r.status === "done").length;
  const n = state.eliminationCount || 0;
  const active = state.teams.filter((t) => !t.eliminatedAfter);
  if (n >= done || active.length <= count) return;

  const out = [...active].sort((a, b) => a.score - b.score).slice(0, count);
  const outIds = out.map((t) => t.id);
  const round = n + 1;

  const event = {
    id: `e${Date.now()}`,
    type: "penalty",
    teamId: null,
    points: 0,
    message: `ELIMINATED after Round ${round}: ${out.map((t) => t.name).join(" & ")}`,
    timestamp: Date.now(),
  };

  commit({
    ...state,
        teams: state.teams.map((t) =>
      outIds.includes(t.id) ? { ...t, eliminatedAfter: round, eliminatedAt: Date.now() } : t
    ),
    eliminationCount: round,
    events: [event, ...state.events].slice(0, 20),
    undoStack: [],
    flash: null,
  });
}

/* ---------- Freeze / reveal ---------- */

export function freeze() {
  if (state.frozen) return;
  commit({ ...state, frozen: true, snapshot: state.teams });
}

export function reveal() {
  commit({ ...state, frozen: false, snapshot: null });
}

/* ---------- Final reveal ---------- */

export function startFinale() {
  const order = state.teams
    .filter((t) => !t.eliminatedAfter)
    .sort((a, b) => b.score - a.score)
    .map((t) => t.id);
  commit({ ...state, finale: { active: true, order, shown: 0 } });
}

export function revealNext() {
  const f = state.finale;
  if (!f?.active || f.shown >= f.order.length) return;
  commit({ ...state, finale: { ...f, shown: f.shown + 1 } });
}

export function closeFinale() {
  commit({ ...state, finale: null });
}

/* ---------- Setup: names, members, cases, questions ---------- */

export function updateTeam(teamId, { name, members, riskLevel }) {
  commit({
    ...state,
    teams: state.teams.map((t) => (t.id === teamId ? { ...t, name, members, riskLevel } : t)),
  });
}

export function updateRound(roundId, { caseTitle, company, questions }) {
  const rounds = state.rounds.map((r) =>
    r.id === roundId ? { ...r, caseTitle, company, questions } : r
  );

  // if the live question's timer hasn't started, keep it in sync with the new minutes
  let timer = state.timer;
  const live = rounds.find((r) => r.status === "live");
  if (live && live.id === roundId && timer.status === "idle") {
    const sec = secondsFor(live, state.qIndex || 0, timer.durationSec);
    timer = { ...timer, durationSec: sec, remainingMs: sec * 1000 };
  }
  commit({ ...state, rounds, timer });
}

// Zero everything, Case 1 live, but keep names, members, case titles and questions
export function startNewGame() {
  const fresh = seed();
  const teams = fresh.teams.map((t) => {
    const old = state.teams.find((o) => o.id === t.id);
    return old ? { ...t, name: old.name, members: old.members, riskLevel: old.riskLevel } : t;
  });
  const rounds = fresh.rounds.map((r) => {
    const old = state.rounds.find((o) => o.id === r.id);
    return old
      ? {
          ...r,
          caseTitle: old.caseTitle,
          company: old.company,
          questions: old.questions || r.questions,
        }
      : r;
  });
  const sec = secondsFor(rounds[0], 0);
  commit({
    ...fresh,
    teams,
    rounds,
    timer: { status: "idle", durationSec: sec, endsAt: 0, remainingMs: sec * 1000 },
  });
}
/* ---------- Zoom (focus) mode ---------- */

export function setFocus(on) {
  commit({ ...state, focus: { size: 1, ...(state.focus || {}), on } });
}

// size: 0 (smaller) to 3 (biggest)
export function setFocusSize(size) {
  const s = Math.min(3, Math.max(0, size));
  commit({ ...state, focus: { on: false, ...(state.focus || {}), size: s } });
}
export const bankPreview = () =>
  `${questionBank[0]?.caseTitle} · ${questionBank.length} cases · ${questionBank
    .map((c) => c.questions.length)
    .join("/")} questions`;

// Overwrite every case's title, company and questions from src/data/questions.js
export function importQuestions() {
  const rounds = state.rounds.map((r, i) => {
    const b = questionBank[i];
    if (!b) return r;
    return {
      ...r,
      caseTitle: b.caseTitle || r.caseTitle,
      company: b.company || r.company,
      questions: (b.questions || []).map((q, j) => ({
        id: `q${j + 1}`,
        minutes: Number(q.minutes) > 0 ? Number(q.minutes) : 5,
        context: (q.context || "").trim(),
      })),
    };
  });

  let timer = state.timer;
  const live = rounds.find((r) => r.status === "live");
  if (live && timer.status === "idle") {
    const sec = secondsFor(live, state.qIndex || 0, timer.durationSec);
    timer = { ...timer, durationSec: sec, remainingMs: sec * 1000 };
  }
  commit({ ...state, rounds, timer });
}