import { useEffect, useState } from "react";
import { rankTeams } from "../lib/rank";
import { useGameState, useReady } from "../hooks/useGameState";
import TeamCard from "../components/TeamCard";
import RoundTimer from "../components/RoundTimer";
import CaseSpotlight from "../components/CaseSpotlight";
import Ticker from "../components/Ticker";
import ChartPanel from "../components/ChartPanel";
import FinalReveal from "../components/FinalReveal";
import FocusView from "../components/FocusView";
import GlobeBackground from "../components/GlobeBackground";
import NetworkBackground from "../components/NetworkBackground";
import TerminalHeader from "../components/TerminalHeader";
import BootSplash from "../components/BootSplash";
import OvertakeBanner from "../components/OvertakeBanner";
import Countdown10 from "../components/Countdown10";

export default function Dashboard() {
  const {
    teams,
    rounds,
    events,
    timer,
    frozen,
    snapshot,
    finale,
    focus,
    qIndex = 0,
    flash: rawFlash,
  } = useGameState();
  const ready = useReady();
  const [banner, setBanner] = useState(null);
  const [contagion, setContagion] = useState(0);

  const shown = frozen && snapshot ? snapshot : teams;
  const ranked = rankTeams(shown);
  const activeTeams = ranked.filter((t) => !t.eliminatedAfter);
  const maxScore = Math.max(1, ...activeTeams.map((t) => t.score));

  const flash =
    !frozen && rawFlash && Math.abs(Date.now() - rawFlash.key) < 8000 ? rawFlash : null;

  // overtake detection: runs once per new score entry
  useEffect(() => {
    if (!flash || flash.type !== "score") return;
    const w = ranked.find((t) => t.id === flash.teamId);
    if (!w || w.eliminatedAfter || w.delta <= 0) return;
    const loser = ranked.find(
      (t) => t.id !== w.id && !t.eliminatedAfter && t.prevRank === w.rank
    );
    if (!loser) return;
    setBanner({
      key: flash.key,
      winner: w.name,
      loser: loser.name,
      rank: w.rank,
      from: w.prevRank,
      color: w.color,
      leader: w.rank === 1,
    });
  }, [flash?.key]);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 3600);
    return () => clearTimeout(id);
  }, [banner]);

  if (!ready) return <div className="min-h-screen bg-void" />;

  // add ?bg=globe to the address to use the globe instead of the network
  const bg = new URLSearchParams(window.location.search).get("bg");

  const liveIdx = rounds.findIndex((r) => r.status === "live");
  const liveRound = liveIdx >= 0 ? rounds[liveIdx] : null;
  const liveLabel = liveIdx >= 0 ? `R${liveIdx + 1} live` : "Final";
  const caseLabel = liveRound ? `CASE ${liveIdx + 1} · Q${qIndex + 1}` : "FINAL";

  return (
    <div className="bg-grid relative min-h-screen overflow-hidden bg-void px-8 pb-24 pt-6">
      {bg === "globe" ? <GlobeBackground /> : <NetworkBackground onStat={setContagion} />}

      {/* vignette, scanlines and a slow sweep for the terminal feel */}
      <div className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_50%_45%,transparent_45%,rgba(0,0,0,0.78)_100%)]" />
      <div className="scanlines sweep pointer-events-none fixed inset-0 z-20 overflow-hidden" />

      <div className="relative z-10">
        <TerminalHeader
          frozen={frozen}
          caseLabel={caseLabel}
          contagion={bg === "globe" ? undefined : contagion}
        />

        <main className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-3">
            {ranked.map((team, i) => (
              <TeamCard key={team.id} team={team} index={i} flash={flash} maxScore={maxScore} />
            ))}
          </section>

          <aside className="space-y-6">
            {liveRound && <CaseSpotlight round={liveRound} qIndex={qIndex} />}
            <RoundTimer timer={timer} />
            <ChartPanel ranked={activeTeams} liveLabel={liveLabel} />
          </aside>
        </main>
      </div>

      <OvertakeBanner banner={banner} />
      {focus?.on && liveRound && (
        <FocusView round={liveRound} qIndex={qIndex} timer={timer} size={focus.size ?? 1} />
      )}
      <Countdown10 timer={timer} />
      {finale?.active && <FinalReveal finale={finale} teams={teams} />}
      <Ticker events={events} />
      <BootSplash />
    </div>
  );
}