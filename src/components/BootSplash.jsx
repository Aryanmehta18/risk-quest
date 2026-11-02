import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINES = [
  "CONNECTING TO GLOBAL RISK FEED",
  "LOADING EXPOSURE MAP · 12 FINANCIAL CENTRES",
  "SYNCING TRADING DESKS",
  "MARKETS OPEN",
];

const seen = () => {
  try {
    return sessionStorage.getItem("rq-boot") === "1";
  } catch {
    return false;
  }
};

export default function BootSplash() {
  const [show, setShow] = useState(() => !seen());

  useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem("rq-boot", "1");
      } catch {
        // ignore
      }
      setShow(false);
    }, 3000);
    return () => clearTimeout(id);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-void"
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.12em" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-display text-8xl font-extrabold text-gold [text-shadow:0_0_40px_rgba(255,174,31,0.5)]"
          >
            RISK QUEST
          </motion.h1>

          <div className="mt-10 w-[34rem] space-y-1.5 font-mono text-sm">
            {LINES.map((l, i) => (
              <motion.p
                key={l}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.5 }}
                className={`flex justify-between ${i === LINES.length - 1 ? "text-gold" : "text-mute"}`}
              >
                <span>&gt; {l}</span>
                <span className="text-up">{i === LINES.length - 1 ? "●" : "OK"}</span>
              </motion.p>
            ))}
          </div>

          <div className="mt-8 h-1 w-[34rem] bg-edge">
            <motion.div
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.6, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}