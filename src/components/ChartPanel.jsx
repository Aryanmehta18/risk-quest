import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RaceChart from "./charts/RaceChart";
import BarRace from "./charts/BarRace";
import TeamRadar from "./charts/TeamRadar";

const VIEWS = [
  { key: "race", title: "Score race" },
  { key: "bars", title: "Standings" },
  { key: "radar", title: "Team radar" },
];

// Auto-rotates for the big screen. Hover the panel to pause it, hover a team chip to
// spotlight that team in the chart, click a chip to open that team's radar.
export default function ChartPanel({ ranked, liveLabel, intervalMs = 10000 }) {
  const [view, setView] = useState(0);
  const [hold, setHold] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const [spotId, setSpotId] = useState(null);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    if (hold) return;
    const id = setTimeout(() => {
      const next = (view + 1) % VIEWS.length;
      setView(next);
      setSpotId(null);
      if (next === 2) setSpin((s) => s + 1);
    }, intervalMs);
    return () => clearTimeout(id);
  }, [view, hold, intervalMs]);

  const spotlight = ranked.find((t) => t.id === spotId) ?? ranked[spin % ranked.length];
  const key = VIEWS[view].key;

  return (
    <div
      className="panel-glass flex h-full flex-col p-5"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => {
        setHold(false);
        setFocusId(null);
      }}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {VIEWS.map((v, i) => (
            <button
              key={v.key}
              onClick={() => setView(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                i === view ? "bg-signal/20 text-signal" : "text-mute hover:text-ink"
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          {hold ? "paused" : "auto"}
        </span>
      </div>

      <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
        {ranked.map((t) => (
          <button
            key={t.id}
            onMouseEnter={() => setFocusId(t.id)}
            onClick={() => {
              setSpotId(t.id);
              setView(2);
            }}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition"
            style={{
              borderColor: focusId === t.id ? t.color : "rgba(255,255,255,0.08)",
              color: focusId && focusId !== t.id ? "#7c89a3" : "#e9eef7",
              boxShadow: focusId === t.id ? `0 0 12px ${t.color}66` : "none",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
            {t.name}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            className="h-full"
            key={key + (key === "radar" ? spotlight.id : "")}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {key === "race" && <RaceChart teams={ranked} liveLabel={liveLabel} focusId={focusId} />}
            {key === "bars" && <BarRace teams={ranked} focusId={focusId} onFocus={setFocusId} />}
            {key === "radar" && <TeamRadar team={spotlight} teams={ranked} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 h-px w-full shrink-0 bg-white/5">
        <motion.div
          key={`${view}-${hold}`}
          className="h-px bg-gold/70"
          style={{ transformOrigin: "left" }}
          initial={{ scaleX: hold ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: hold ? 0 : intervalMs / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}
