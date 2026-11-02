import { AnimatePresence, motion } from "framer-motion";

export default function OvertakeBanner({ banner }) {
  return (
    <>
      {banner?.leader && (
        <motion.div
          key={`pulse-${banner.key}`}
          className="pointer-events-none fixed inset-0 z-[34] bg-gold/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.2 }}
        />
      )}

      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.key}
            className="pointer-events-none fixed inset-x-0 top-28 z-[35] flex justify-center"
            initial={{ x: "-110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "110%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          >
            <div
              className={`relative overflow-hidden border-y-2 bg-void/90 px-10 py-3 text-center backdrop-blur ${
                banner.leader
                  ? "border-gold shadow-[0_0_60px_rgba(255,174,31,0.45)]"
                  : "border-up/70 shadow-[0_0_40px_rgba(31,224,160,0.25)]"
              }`}
            >
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-150%" }}
                animate={{ x: "450%" }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              <p
                className={`font-mono text-[11px] font-bold tracking-[0.4em] ${
                  banner.leader ? "text-gold" : "text-up"
                }`}
              >
                {banner.leader ? "★ NEW LEADER" : "▲ POSITION CHANGE"}
              </p>
              <p className="font-display text-4xl font-extrabold uppercase tracking-wide text-ink">
                <span style={{ color: banner.color }}>{banner.winner}</span>{" "}
                <span className="text-mute">overtakes</span> {banner.loser}
              </p>
              <p className="font-mono text-xs text-mute">
                #{banner.from} → #{banner.rank}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}