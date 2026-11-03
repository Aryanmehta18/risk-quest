import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useGameState, useReady } from "../hooks/useGameState";
import * as game from "../lib/store";
import FormattedContext from "../components/FormattedContext";
import { questionBank } from "../data/questions";

const card = "rounded-xl border border-edge bg-surface p-5";
const label = "mb-2 block text-xs uppercase tracking-[0.3em] text-mute";
const input =
  "w-full rounded-lg border border-edge bg-void px-3 py-2 text-ink outline-none focus:border-signal";

const QUICK = [-20, -10, -5, 5, 10, 20];
const ord = (n) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const ready = useReady();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="min-h-screen bg-void" />;
  if (!session) return <Gate />;
  if (!ready) return <div className="min-h-screen bg-void" />;
  return <Panel />;
}

function Gate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("Wrong email or password.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-6">
      <div className={`${card} w-full max-w-sm`}>
        <h1 className="font-display text-2xl font-black text-gold">ADMIN</h1>
        <p className="mb-4 mt-1 text-sm text-mute">Organizers only.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={input}
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          className={`${input} mt-3`}
        />
        {error && <p className="mt-2 text-sm text-risk">{error}</p>}
        <button
          onClick={submit}
          className="mt-4 w-full rounded-lg bg-signal/20 px-4 py-2 font-semibold text-signal transition hover:bg-signal/30"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function Panel() {
  const {
  teams,
  rounds,
  events,
  undoStack,
  frozen,
  timer,
  finale,
  focus,
  eliminationCount = 0,
  qIndex = 0,
} = useGameState();

  useEffect(() => {
    game.ensureState();
  }, []);

  const [teamId, setTeamId] = useState(teams[0].id);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState("");

  const value = Number(points);
  const canApply = points !== "" && Number.isFinite(value) && value !== 0;
  const liveRound = rounds.find((r) => r.status === "live");

  const questions = liveRound?.questions || [];
  const currentQ = questions[qIndex];
  const isLastQ = qIndex >= questions.length - 1;

  const activeTeams = teams.filter((t) => !t.eliminatedAfter);
  const selectedId = activeTeams.some((t) => t.id === teamId) ? teamId : activeTeams[0]?.id;
  const doneRounds = rounds.filter((r) => r.status === "done").length;
  const bottomTwo = [...activeTeams].sort((a, b) => a.score - b.score).slice(0, 2);
  const canEliminate = eliminationCount < doneRounds && activeTeams.length > 2;

  const allDone = !liveRound && eliminationCount >= rounds.length;
  const finaleLeft = finale?.active ? finale.order.length - finale.shown : 0;

  const lastUndo = undoStack[undoStack.length - 1];
  const lastEvent = lastUndo && events.find((e) => e.id === lastUndo.eventId);

  const apply = () => {
    if (!canApply) return;
    game.addPoints(selectedId, value, reason.trim());
    setPoints("");
    setReason("");
  };

  const applyMinutes = () => {
    const m = Number(minutes);
    if (m > 0) {
      game.setDuration(Math.round(m * 60));
      setMinutes("");
    }
  };

  const timerLabel =
    timer.status === "running" ? "Running" : timer.status === "paused" ? "Paused" : "Ready";

  return (
    <div className="min-h-screen bg-void px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-black text-gold">ADMIN</h1>
          <div className="flex items-center gap-4 text-sm">
            {frozen && (
              <span className="rounded-full bg-signal/15 px-3 py-1 font-semibold text-signal">
                SCORES FROZEN
              </span>
            )}
            <Link to="/" className="text-mute underline hover:text-ink">
              Open dashboard
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-mute underline hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Score entry */}
          <section className={card}>
            <span className={label}>Add points</span>

            <select
              value={selectedId}
              onChange={(e) => setTeamId(e.target.value)}
              className={input}
            >
              {activeTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.score})
                </option>
              ))}
            </select>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setPoints(String(q))}
                  className={`rounded-md px-3 py-1 text-sm font-semibold transition ${
                    q > 0
                      ? "bg-gold/15 text-gold hover:bg-gold/25"
                      : "bg-risk/15 text-risk hover:bg-risk/25"
                  }`}
                >
                  {q > 0 ? `+${q}` : q}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Points (use − for penalty)"
              className={`${input} mt-3`}
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="Reason (shows in ticker)"
              className={`${input} mt-3`}
            />

            <button
              onClick={apply}
              disabled={!canApply}
              className="mt-4 w-full rounded-lg bg-gold/20 px-4 py-2 font-semibold text-gold transition hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply
            </button>

            <button
              onClick={game.undoLast}
              disabled={!lastUndo}
              className="mt-3 w-full rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Undo last entry
            </button>
            {lastEvent && <p className="mt-2 text-xs text-mute">Last: {lastEvent.message}</p>}
          </section>

          {/* Round + question controls */}
          <section className={card}>
            <span className={label}>Round</span>
            <p className="font-display text-xl font-bold">
              {liveRound ? liveRound.caseTitle : "All rounds finished"}
            </p>
            {liveRound && <p className="text-sm text-mute">{liveRound.company}</p>}

            {currentQ && (
              <div className="mt-3 rounded-lg border border-edge bg-void p-3">
                <p className="text-sm font-semibold text-signal">
                  Question {qIndex + 1} of {questions.length} · {currentQ.minutes} min
                </p>
                <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-mute">
                  {currentQ.context || "No context added for this question."}
                </p>
              </div>
            )}

            <p className="mt-3 text-sm text-mute">
              Timer: <span className="font-semibold text-ink">{timerLabel}</span>
            </p>

            <div className="mt-3 flex gap-3">
              <button
                onClick={game.startTimer}
                disabled={timer.status === "running"}
                className="flex-1 rounded-lg bg-signal/20 px-4 py-2 font-semibold text-signal transition hover:bg-signal/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {timer.status === "paused" ? "Resume" : "Start"}
              </button>
              <button
                onClick={game.pauseTimer}
                disabled={timer.status !== "running"}
                className="flex-1 rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Pause
              </button>
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={game.prevQuestion}
                disabled={!liveRound || qIndex === 0}
                className="rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Move to question ${qIndex + 2}? The timer resets.`))
                    game.nextQuestion();
                }}
                disabled={!liveRound || isLastQ}
                className="flex-1 rounded-lg bg-signal/20 px-4 py-2 font-semibold text-signal transition hover:bg-signal/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next question →
              </button>
            </div>
            <div className="mt-3 flex gap-3">
  <button
    onClick={() => game.setFocus(!focus?.on)}
    disabled={!liveRound}
    className={`flex-1 rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      focus?.on
        ? "bg-gold/20 text-gold hover:bg-gold/30"
        : "bg-signal/20 text-signal hover:bg-signal/30"
    }`}
  >
    {focus?.on ? "Exit zoom" : "Zoom question + timer"}
  </button>
  <button
    onClick={() => game.setFocusSize((focus?.size ?? 1) - 1)}
    disabled={(focus?.size ?? 1) <= 0}
    className="rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70 disabled:cursor-not-allowed disabled:opacity-40"
  >
    A−
  </button>
  <button
    onClick={() => game.setFocusSize((focus?.size ?? 1) + 1)}
    disabled={(focus?.size ?? 1) >= 3}
    className="rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70 disabled:cursor-not-allowed disabled:opacity-40"
  >
    A+
  </button>
</div>
            <div className="mt-3 flex gap-3">
              <input
                type="number"
                min="1"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="min"
                className={`${input} w-24`}
              />
              <button
                onClick={applyMinutes}
                className="flex-1 rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70"
              >
                Change this timer (minutes)
              </button>
            </div>

            <button
              onClick={() => {
                const msg = isLastQ
                  ? "End this round and move to the next one?"
                  : `You are on question ${qIndex + 1} of ${questions.length}. End the round anyway?`;
                if (window.confirm(msg)) game.endRound();
              }}
              disabled={!liveRound}
              className="mt-4 w-full rounded-lg bg-risk/15 px-4 py-2 font-semibold text-risk transition hover:bg-risk/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              End round
            </button>
          </section>

          {/* Elimination */}
          <section className={card}>
            <span className={label}>Elimination</span>
            {canEliminate ? (
              <>
                <p className="mb-2 text-sm text-mute">Lowest two scores go out:</p>
                <ul className="mb-4 space-y-1 text-sm font-semibold text-risk">
                  {bottomTwo.map((t) => (
                    <li key={t.id}>
                      ✕ {t.name} ({t.score})
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (
                      window.confirm(`Eliminate ${bottomTwo.map((t) => t.name).join(" and ")}?`)
                    )
                      game.eliminateBottom(2);
                  }}
                  className="w-full rounded-lg bg-risk/15 px-4 py-3 font-semibold text-risk transition hover:bg-risk/25"
                >
                  Eliminate bottom 2
                </button>
              </>
            ) : (
              <p className="text-sm text-mute">
                {activeTeams.length <= 2
                  ? "Only the finalists are left."
                  : "End the current round first."}
              </p>
            )}
          </section>

          {/* Freeze / reveal */}
          <section className={card}>
            <span className={label}>Final suspense</span>
            <p className="mb-4 text-sm text-mute">
              Freeze hides new scores from the public screen. You keep scoring. Reveal makes the
              screen jump to the real standings.
            </p>
            {frozen ? (
              <button
                onClick={game.reveal}
                className="w-full rounded-lg bg-gold/20 px-4 py-3 font-display text-lg font-bold text-gold transition hover:bg-gold/30"
              >
                REVEAL SCORES
              </button>
            ) : (
              <button
                onClick={game.freeze}
                className="w-full rounded-lg bg-signal/20 px-4 py-3 font-display text-lg font-bold text-signal transition hover:bg-signal/30"
              >
                FREEZE SCORES
              </button>
            )}
          </section>

          {/* Final reveal */}
          <section className={card}>
            <span className={label}>Final reveal</span>
            {!finale?.active ? (
              <>
                <p className="mb-4 text-sm text-mute">
                  After the last question the public screen shows "Updating final scores". Press the
                  green button when you are ready: it opens the full-screen reveal, and you then
                  reveal each place yourself, from last to first.
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm("Start the final reveal? Finalists are locked in by current scores.")
                    )
                      game.startFinale();
                  }}
                  disabled={!allDone}
                  className="w-full rounded-lg border border-up/50 bg-up/20 px-4 py-3 font-display text-lg font-bold text-up transition hover:bg-up/30 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-edge disabled:text-mute disabled:opacity-60"
                >
                  ✓ GREEN SIGNAL: REVEAL WINNERS
                </button>
                {!allDone && (
                  <p className="mt-2 text-xs text-mute">
                    Unlocks after Case 3 ends and its eliminations are done.
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={game.revealNext}
                  disabled={finaleLeft === 0}
                  className="w-full rounded-lg bg-gold/20 px-4 py-3 font-display text-lg font-bold text-gold transition hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {finaleLeft > 0
                    ? `REVEAL ${ord(finaleLeft).toUpperCase()} PLACE`
                    : "WINNER REVEALED 🎉"}
                </button>
                <button
                  onClick={game.closeFinale}
                  className="mt-3 w-full rounded-lg bg-edge px-4 py-2 font-semibold text-ink transition hover:bg-edge/70"
                >
                  Close reveal
                </button>
              </>
            )}
          </section>

          {/* Recent entries */}
          <section className={card}>
            <span className={label}>Recent entries</span>
            <ul className="space-y-2 text-sm">
              {events.slice(0, 6).map((e) => (
                <li
                  key={e.id}
                  className={
                    e.type === "penalty"
                      ? "text-risk"
                      : e.type === "score"
                        ? "text-gold"
                        : "text-signal"
                  }
                >
                  ◆ {e.message}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Start a NEW game? All scores, rounds, history and eliminations reset. Names, members, case titles and questions are kept."
                  )
                )
                  game.startNewGame();
              }}
              className="mt-5 text-xs text-mute underline hover:text-risk"
            >
              Start new game (keep names)
            </button>
          </section>

          {/* Setup */}
          <SetupSection teams={teams} rounds={rounds} />
        </div>
      </div>
    </div>
  );
}

function SetupSection({ teams, rounds }) {
  const [msg, setMsg] = useState("");
  const [armed, setArmed] = useState(false);

  const fileInfo = `${questionBank[0]?.caseTitle ?? "?"} · ${questionBank.length} cases · ${questionBank
    .map((c) => c.questions.length)
    .join("/")} questions`;

  const load = async () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    setArmed(false);
    try {
      if (typeof game.importQuestions !== "function") {
        throw new Error("importQuestions is missing in store.js");
      }
      await game.importQuestions();
      setMsg(`✓ Loaded: ${fileInfo}`);
    } catch (e) {
      setMsg(`✗ ${e.message}`);
    }
  };

  return (
    <section className={`${card} md:col-span-2`}>
      <span className={label}>Setup · teams and cases</span>
      <p className="mb-4 text-sm text-mute">
        Saves to the cloud and shows on the dashboard right away. Scores are not affected.
      </p>

      <div className="space-y-3">
        {teams.map((t) => (
          <TeamRow key={t.id} team={t} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <span className={label}>Cases and questions</span>
        <button
          onClick={load}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            armed
              ? "bg-risk/20 text-risk hover:bg-risk/30"
              : "bg-signal/20 text-signal hover:bg-signal/30"
          }`}
        >
          {armed ? "Click again to replace everything" : "Load all from questions.js"}
        </button>
      </div>
      <p className="mb-1 font-mono text-xs text-mute">File on disk: {fileInfo}</p>
      {msg && (
        <p className={`mb-3 font-mono text-xs ${msg.startsWith("✓") ? "text-up" : "text-risk"}`}>
          {msg}
        </p>
      )}

      <div className="space-y-4">
        {rounds.map((r, i) => (
          <RoundRow
            key={`${r.id}-${r.caseTitle}-${r.company}-${JSON.stringify(r.questions)}`}
            round={r}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

function TeamRow({ team }) {
  const [name, setName] = useState(team.name);
  const [members, setMembers] = useState(team.members);
  const [risk, setRisk] = useState(team.riskLevel);

  const dirty =
    name !== team.name ||
    risk !== team.riskLevel ||
    members.some((m, i) => m !== team.members[i]);

  const save = () => {
    const cleanName = name.trim() || team.name;
    const cleanMembers = members.map((m) => m.trim());
    setName(cleanName);
    setMembers(cleanMembers);
    game.updateTeam(team.id, { name: cleanName, members: cleanMembers, riskLevel: risk });
  };

  return (
    <div className="grid items-center gap-2 md:grid-cols-[1.2fr_1fr_1fr_1fr_7rem_5rem]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Team name"
        className={input}
      />
      {members.map((m, i) => (
        <input
          key={i}
          value={m}
          onChange={(e) => setMembers(members.map((x, j) => (j === i ? e.target.value : x)))}
          placeholder={`Member ${i + 1}`}
          className={input}
        />
      ))}
      <select value={risk} onChange={(e) => setRisk(e.target.value)} className={input}>
        <option value="safe">Safe</option>
        <option value="moderate">Moderate</option>
        <option value="high">High risk</option>
      </select>
      <button
        onClick={save}
        disabled={!dirty}
        className="rounded-lg bg-gold/20 px-3 py-2 font-semibold text-gold transition hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}

function RoundRow({ round, index }) {
  const initialQs = round.questions || game.defaultQuestions();
  const [title, setTitle] = useState(round.caseTitle);
  const [company, setCompany] = useState(round.company);
  const [qs, setQs] = useState(initialQs);
  const [pv, setPv] = useState(null);

  const dirty =
    title !== round.caseTitle ||
    company !== round.company ||
    JSON.stringify(qs) !== JSON.stringify(initialQs);

  const setQ = (i, patch) => setQs(qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  const save = () => {
    const t = title.trim() || round.caseTitle;
    const c = company.trim() || round.company;
    const cleanQs = qs.map((q) => ({
      ...q,
      minutes: Number(q.minutes) > 0 ? Number(q.minutes) : 5,
      context: (q.context || "").trim(),
    }));
    setTitle(t);
    setCompany(c);
    setQs(cleanQs);
    game.updateRound(round.id, { caseTitle: t, company: c, questions: cleanQs });
  };

  return (
    <div className="rounded-lg border border-edge p-4">
      <div className="grid items-center gap-2 md:grid-cols-[4rem_1.5fr_1fr_5rem]">
        <span className="text-sm font-semibold text-mute">Case {index + 1}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Case title"
          className={input}
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className={input}
        />
        <button
          onClick={save}
          disabled={!dirty}
          className="rounded-lg bg-gold/20 px-3 py-2 font-semibold text-gold transition hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {qs.map((q, i) => (
          <div key={q.id || i} className="grid items-start gap-2 md:grid-cols-[4rem_6rem_1fr]">
            <span className="pt-2 text-sm font-semibold text-signal">Q{i + 1}</span>
            <input
              type="number"
              min="1"
              value={q.minutes}
              onChange={(e) => setQ(i, { minutes: e.target.value })}
              placeholder="min"
              className={input}
            />
            <textarea
              rows={3}
              value={q.context || ""}
              onChange={(e) => setQ(i, { context: e.target.value })}
              placeholder="Context shown on the screen while this question is live"
              className={input}
            />
            <div className="md:col-start-3">
              <button
                onClick={() => setPv(pv === i ? null : i)}
                className="text-xs text-mute underline hover:text-ink"
              >
                {pv === i ? "Hide preview" : "Preview"}
              </button>
            </div>
            {pv === i && (
              <div className="rounded-lg border border-edge bg-void p-4 text-xl md:col-start-3">
                <FormattedContext text={q.context} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}