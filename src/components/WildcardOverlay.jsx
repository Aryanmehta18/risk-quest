import { AnimatePresence, motion } from "framer-motion";

export default function WildcardOverlay({ wildcard }) {
  return (
    <AnimatePresence>
      {wildcard && (
        <motion.div
          key={wildcard.key}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -3, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="rounded-2xl border-4 border-risk bg-surface px-16 py-10 text-center shadow-[0_0_80px_rgba(255,46,77,0.6)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-mute">⚠ Wildcard</p>
            <h2 className="mt-4 font-display text-7xl font-black tracking-wide text-ink">
              {wildcard.title}
            </h2>
            <p className="mt-4 text-xl text-mute">{wildcard.subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}