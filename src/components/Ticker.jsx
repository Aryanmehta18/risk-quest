const style = {
  score: { color: "text-gold", glyph: "▲" },
  penalty: { color: "text-risk", glyph: "▼" },
  wildcard: { color: "text-signal", glyph: "◆" },
};

export default function Ticker({ events }) {
  const reps = Math.max(2, Math.ceil(12 / Math.max(1, events.length)));
  const half = Array.from({ length: reps }, () => events).flat();
  const items = [...half, ...half];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch overflow-hidden border-t border-gold/40 bg-void">
      <div className="relative z-10 flex shrink-0 items-center gap-2 bg-gold px-5 font-mono text-xs font-bold tracking-[0.2em] text-void">
        <span className="h-2 w-2 animate-pulse rounded-full bg-void" />
        RISK FEED
      </div>
      <div className="relative flex-1 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]">
        <div className="flex w-max animate-ticker whitespace-nowrap">
          {items.map((e, i) => {
            const s = style[e.type] ?? { color: "text-ink", glyph: "◆" };
            return (
              <span key={`${e.id}-${i}`} className={`pr-14 font-mono text-sm font-medium ${s.color}`}>
                {s.glyph} {e.message}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}