import { useEffect, useState } from "react";
import { rankTeams } from "../lib/rank";
import { withRisk } from "../lib/risk";
import { useGameState, useReady } from "../hooks/useGameState";
import TeamCard from "../components/TeamCard";
import CaseSpotlight from "../components/CaseSpotlight";
import Ticker from "../components/Ticker";
import ChartPanel from "../components/ChartPanel";
import FinalReveal from "../components/FinalReveal";
import FocusView from "../components/FocusView";
import TerminalHeader from "../components/TerminalHeader";
import BootSplash from "../components/BootSplash";
import OvertakeBanner from "../components/OvertakeBanner";
import Countdown10 from "../components/Countdown10";
import FinalHold from "../components/FinalHold";
import { useTimerMs } from "../hooks/useTimerMs";
import ScaledStage from "../components/ScaledStage";

export function DashboardView({
  teams, rounds, events, timer, frozen, snapshot, eventsSnapshot, finale, finalClosed, focus, qIndex = 0, flash: rawFlash,
}) {
  const [banner, setBanner] = useState(null);
  const { ms: timerMs } = useTimerMs(timer);

  // while scores are frozen, teams, charts, risk levels and the risk feed all show the frozen moment
  const shown = frozen && snapshot ? snapshot : teams;
  const feed = frozen && eventsSnapshot ? eventsSnapshot : events;
  const ranked = rankTeams(shown);
  const activeTeams = ranked.filter((t) => !t.eliminatedAfter);
  const maxScore = Math.max(1, ...activeTeams.map((t) => t.score));
  // ratings and risk levels stay hidden until the first scores are in (frozen-aware: uses the frozen view)
  const scoresStarted = ranked.some((t) => t.score !== 0);
  const flash = !frozen && rawFlash && Math.abs(Date.now() - rawFlash.key) < 8000 ? rawFlash : null;

  // overtake detection: runs once per new score entry
  useEffect(() => {
    if (!flash || flash.type !== "score") return;
    const w = ranked.find((t) => t.id === flash.teamId);
    if (!w || w.eliminatedAfter || w.delta <= 0) return;
    const loser = ranked.find((t) => t.id !== w.id && !t.eliminatedAfter && t.prevRank === w.rank);
    if (!loser) return;
    setBanner({ key: flash.key, winner: w.name, loser: loser.name, rank: w.rank, from: w.prevRank, color: w.color, leader: w.rank === 1 });
  }, [flash?.key]);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 3600);
    return () => clearTimeout(id);
  }, [banner]);

  const liveIdx = rounds.findIndex((r) => r.status === "live");
  const liveRound = liveIdx >= 0 ? rounds[liveIdx] : null;
  const liveLabel = liveIdx >= 0 ? `R${liveIdx + 1} live` : "Final";
  const caseLabel = liveRound ? `CASE ${liveIdx + 1} · Q${qIndex + 1}` : "FINAL";

  // "Updating final scores" holding screen: from the end of the last question of the last case
  // (its timer reaches 0, or every case is marked done) until the admin starts the final reveal.
  const lastQuestionOver =
    liveIdx >= 0 && liveIdx === rounds.length - 1 &&
    qIndex >= (liveRound.questions?.length || 1) - 1 &&
    timer.status === "running" && timerMs === 0;
  const allCasesDone = rounds.length > 0 && rounds.every((r) => r.status === "done");
  const holding = !finale?.active && !finalClosed && (allCasesDone || lastQuestionOver);

  return (
    <>
      <ScaledStage>
        <div className="relative flex h-full w-full flex-col px-10 pb-[84px] pt-8">
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <TerminalHeader frozen={frozen} caseLabel={caseLabel} />
            <main className="grid min-h-0 flex-1 grid-cols-[1180px_1fr] gap-8">
              <section
                className="grid min-h-0 gap-2.5"
                style={{ gridTemplateRows: `repeat(${ranked.length}, minmax(0, 1fr))` }}
              >
                {withRisk(ranked).map((team, i) => (
                  <TeamCard key={team.id} team={team} index={i} flash={flash} maxScore={maxScore} showRatings={scoresStarted} />
                ))}
              </section>
              <aside className="flex min-h-0 flex-col gap-5">
                {liveRound && (
                  <div className="shrink-0">
                    <CaseSpotlight round={liveRound} qIndex={qIndex} />
                  </div>
                )}
                <div className="min-h-0 flex-1">
                  <ChartPanel ranked={activeTeams} liveLabel={liveLabel} />
                </div>
              </aside>
            </main>
          </div>
        </div>
        <Ticker events={feed} frozen={frozen} />
      </ScaledStage>

      <OvertakeBanner banner={banner} />
      {holding && <FinalHold />}
      {!holding && focus?.on && liveRound && <FocusView round={liveRound} qIndex={qIndex} timer={timer} size={focus.size ?? 1} />}
      <Countdown10 timer={timer} />
      {finale?.active && <FinalReveal finale={finale} teams={teams} />}
      <BootSplash />
    </>
  );
}

export default function Dashboard() {
  const state = useGameState();
  const ready = useReady();
  if (!ready) return <div className="fixed inset-0 bg-void" />;
  return <DashboardView {...state} />;
}