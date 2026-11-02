import { motion } from "framer-motion";

export default function BarRace({ teams, focusId, onFocus }) {
  const max = Math.max(...teams.map((t) => t.score), 1);
  return (
    <div className="space-y-2.5 py-1">
      {teams.map((t, i) => (
        <motion.div
          key={t.id}
          layout
          onMouseEnter={() => onFocus(t.id)}
          animate={{ opacity: focusId && focusId !== t.id ? 0.35 : 1 }}
          transition={{ layout: { type: "spring", stiffness: 260, damping: 28 }, opacity: { duration: 0.2 } }}
          className="flex items-center gap-3"
        >
          <span className="w-5 text-right font-mono text-[11px] text-mute">{t.rank}</span>
          <span className="w-24 truncate text-xs font-semibold text-ink">{t.name}</span>
          <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(t.score / max) * 100}%` }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: `linear-gradient(90deg, ${t.color}40, ${t.color})`,
                boxShadow: `0 0 14px ${t.color}66`,
              }}
            />
          </div>
          <span className="w-10 text-right font-display text-sm font-bold text-gold">{t.score}</span>
        </motion.div>
      ))}
    </div>
  );
}