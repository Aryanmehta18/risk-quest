import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

// risk appetite: how many of 3 bars are lit
const RISK = {
  safe: { n: 1, label: "LOW", color: "#3AA0FF" },
  moderate: { n: 2, label: "MED", color: "#FFAE1F" },
  high: { n: 3, label: "HIGH", color: "#FF3B57" },
};
// credit-style rating by league position (placeholder logic, easy to change)
const RATINGS = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC"];
const ratingColor = (r) =>
  r.startsWith("A") ? "text-signal border-signal/40 bg-signal/10"
  : r.startsWith("BB") ? "text-gold border-gold/40 bg-gold/10"
  : "text-risk border-risk/40 bg-risk/10";

export default function TeamCard({ team, index, flash, maxScore = 1 }) {
  const risk = RISK[team.riskLevel] || RISK.moderate;
  const out = Boolean(team.eliminatedAfter);
  const isLeader = team.rank === 1 && !out;
  const rating = out ? "D" : RATINGS[Math.min(team.rank - 1, RATINGS.length - 1)];
  const shake = useAnimationControls();
  const isMine = flash && flash.teamId === team.id;
  const gain = Boolean(isMine && flash.type === "score");
  const loss = Boolean(isMine && flash.type === "penalty");
  const pct = out ? 0 : Math.max(2, (team.score / maxScore) * 100);

  useEffect(() => {
    if (loss) shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.45 } });
  }, [loss, flash?.key, shake]);

  return (
    <motion.div
      layout
      className="relative"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { delay: index * 0.07, duration: 0.4 },
        y: { delay: index * 0.07, type: "spring", stiffness: 200, damping: 22 },
      }}
    >
      <motion.div
        animate={shake}
        className={`panel-glass relative isolate grid grid-cols-[3.5rem_1fr_4.5rem_6rem_4rem_6rem] items-center gap-4 overflow-hidden px-5 py-3 ${
          isLeader ? "!border-gold/50 shadow-[0_0_34px_-8px_rgba(255,174,31,0.35)]" : ""
        } ${out ? "opacity-40 grayscale" : ""}`}
      >
        <span className="absolute inset-y-0 left-0 w-1" style={{ background: team.color }} />
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 -z-10"
          style={{ background: `linear-gradient(90deg, ${team.color}26, transparent)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        {isMine && (
          <motion.div
            key={flash.key}
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: loss ? "#FF3B57" : "#FFAE1F" }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
        )}
        {isMine && typeof flash.points === "number" && (
          <motion.span
            key={`pop-${flash.key}`}
            className={`pointer-events-none absolute right-6 top-1/2 z-10 -translate-y-1/2 font-display text-2xl font-extrabold ${gain ? "text-up" : "text-risk"}`}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -14, -26, -34], scale: [0.7, 1.25, 1, 1] }}
            transition={{ duration: 1.5, times: [0, 0.15, 0.7, 1] }}
          >
            {gain ? "+" : "−"}{Math.abs(flash.points)}
          </motion.span>
        )}

        <span className={`font-display text-3xl font-extrabold ${isLeader ? "text-gold" : "text-mute"}`}>
          {out ? "OUT" : team.rank}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="truncate font-display text-2xl font-bold uppercase tracking-wide">{team.name}</span>
            {!out && team.streak >= 2 && (
              <span className="rounded-full bg-risk/15 px-2 py-0.5 text-xs font-semibold text-risk">🔥 {team.streak}</span>
            )}
            {out && (
              <span className="rounded-full bg-risk/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-risk">
                ELIMINATED · R{team.eliminatedAfter}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-mute">{team.members.join(" · ")}</p>
        </div>

        <span className={`justify-self-start rounded-md border px-2 py-0.5 text-center font-mono text-sm font-bold ${ratingColor(rating)}`}>
          {rating}
        </span>

        <div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{ background: i <= risk.n ? risk.color : "rgba(255,255,255,0.08)", boxShadow: i <= risk.n ? `0 0 8px ${risk.color}88` : "none" }}
              />
            ))}
          </div>
          <p className="mt-1 font-mono text-[10px] tracking-widest" style={{ color: risk.color }}>RISK {risk.label}</p>
        </div>

        <span className={`text-center font-mono text-sm font-bold ${team.delta > 0 ? "text-up" : team.delta < 0 ? "text-risk" : "text-mute"}`}>
          {team.delta > 0 ? `▲ ${team.delta}` : team.delta < 0 ? `▼ ${Math.abs(team.delta)}` : "–"}
        </span>

        <AnimatedNumber value={team.score} className="text-right font-display text-4xl font-extrabold text-gold" />
      </motion.div>
    </motion.div>
  );
}