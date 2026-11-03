import { motion } from "framer-motion";

// Shown on the public screen after the last question of the last case,
// until the admin gives the green signal (START FINAL REVEAL).
export default function FinalHold() {
  return (
    <motion.div
      className="fixed inset-0 z-[44] flex flex-col items-center justify-center overflow-hidden bg-void"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="desk-bg absolute inset-0" />
      <motion.div
        className="absolute h-[70vh] w-[70vh] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,174,31,0.16), transparent 65%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col items-center px-8 text-center">
        <p className="font-mono text-[1.1vw] uppercase tracking-[0.6em] text-signal">Risk Quest · Final</p>

        <div className="relative my-[5vh] h-[16vh] w-[16vh]">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-gold border-r-gold/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[12%] rounded-full border-[3px] border-transparent border-b-signal border-l-signal/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[26%] rounded-full border-[3px] border-transparent border-t-risk border-r-risk/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            className="absolute left-1/2 top-1/2 h-[1.6vh] w-[1.6vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <h1 className="font-display text-[6.5vw] font-extrabold uppercase leading-none tracking-wide text-ink">
          Updating <span className="text-gold [text-shadow:0_0_40px_rgba(255,174,31,0.5)]">Final Scores</span>
        </h1>

        <p className="mt-[3vh] flex items-center gap-1 font-mono text-[1.4vw] uppercase tracking-[0.35em] text-mute">
          Please stand by
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            >
              .
            </motion.span>
          ))}
        </p>

        <div className="relative mt-[5vh] h-[0.5vh] w-[30vw] overflow-hidden rounded-full bg-edge">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}