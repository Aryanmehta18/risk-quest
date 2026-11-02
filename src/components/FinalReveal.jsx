import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const ord = (n) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

export default function FinalReveal({ finale, teams }) {
  const order = finale.order.map((id) => teams.find((t) => t.id === id)).filter(Boolean);
  const n = order.length;
  const done = finale.shown >= n;

  // Confetti once the winner is revealed
  useEffect(() => {
    if (!done) return;
    const colors = ["#FFC83D", "#2F8CFF", "#FF2E4D"];
    const end = Date.now() + 5000;
    let raf;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [done]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-void px-8 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.6em] text-mute">
        Risk Quest · Final
      </p>
      <h1 className="mt-3 font-display text-5xl font-black text-gold">
        {done ? "CHAMPIONS" : "AND THE WINNER IS…"}
      </h1>

      <div className="mt-10 w-full max-w-3xl space-y-4">
        {order.map((team, i) => {
          const rank = i + 1;
          const revealed = rank >= n - finale.shown + 1;
          const winner = rank === 1;

          if (!revealed) {
            return (
              <div
                key={team.id}
                className="flex items-center gap-6 rounded-2xl border border-edge bg-surface px-8 py-6 opacity-60"
              >
                <span className="font-display text-3xl font-black text-mute">#{rank}</span>
                <span className="font-display text-3xl font-black tracking-[0.5em] text-edge">
                  ? ? ?
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={team.id}
              initial={{ x: -120, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: winner ? 1.04 : 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className={`rounded-2xl border bg-surface px-8 py-6 ${
                winner
                  ? "border-gold shadow-[0_0_60px_rgba(255,200,61,0.45)]"
                  : "border-signal/50"
              }`}
              style={{ borderLeft: `8px solid ${team.color}` }}
            >
              <div className="flex items-center gap-6">
                <span
                  className={`font-display text-4xl font-black ${winner ? "text-gold" : "text-signal"}`}
                >
                  {winner ? "👑" : ""} #{rank}
                </span>
                <span className="flex-1 font-display text-4xl font-black text-ink">{team.name}</span>
                <span className="font-display text-4xl font-black text-gold">{team.score}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {team.members.map((m, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + j * 0.2 }}
                    className={`rounded-full px-4 py-1.5 font-semibold ${
                      winner ? "bg-gold/20 text-gold" : "bg-edge text-ink"
                    } ${winner ? "text-xl" : "text-base"}`}
                  >
                    {m}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!done && n - finale.shown >= 1 && (
        <p className="mt-8 text-sm uppercase tracking-[0.4em] text-mute">
          Next up: {ord(n - finale.shown)} place
        </p>
      )}
    </motion.div>
  );
}