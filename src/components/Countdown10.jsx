import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Countdown10({ timer }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(id);
  }, []);

  const running = timer.status === "running";
  const remaining = running ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0;
  const urgent = running && remaining >= 1 && remaining <= 10;
  const sinceEnd = now - timer.endsAt;
  const boom = running && sinceEnd >= 0 && sinceEnd < 2600;

  return (
    <>
      {urgent && (
        <div className="animate-heartbeat pointer-events-none fixed inset-0 z-[45] shadow-[inset_0_0_180px_rgba(255,59,87,0.6)]" />
      )}

      <AnimatePresence mode="wait">
        {urgent && (
          <motion.div
            key={remaining}
            className="pointer-events-none fixed inset-0 z-[46] flex items-center justify-center"
            initial={{ opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.35 }}
          >
            <span className="font-display text-[26vw] font-black leading-none text-risk/25 [text-shadow:0_0_90px_rgba(255,59,87,0.5)]">
              {remaining}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {boom && (
          <motion.div
            key="boom"
            className="pointer-events-none fixed inset-0 z-[47] flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute h-[30vmin] w-[30vmin] rounded-full border-4 border-risk"
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: 7, opacity: 0 }}
                transition={{ duration: 1.8, delay: i * 0.3, ease: "easeOut" }}
              />
            ))}
            <motion.p
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="font-display text-9xl font-black tracking-[0.1em] text-risk [text-shadow:0_0_60px_rgba(255,59,87,0.8)]"
            >
              TIME'S UP
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}