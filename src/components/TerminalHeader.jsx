export default function TerminalHeader({ frozen, caseLabel }) {
  return (
    <header className="mb-5 flex items-end justify-between gap-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-signal">Risk Desk</p>
        <h1 className="font-display text-5xl font-extrabold tracking-[0.06em] text-ink">
          RISK <span className="text-gold">QUEST</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {frozen && (
          <span className="rounded-full border border-signal/50 bg-signal/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-signal">
            SCORES FROZEN
          </span>
        )}
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 font-mono text-xs font-semibold tracking-widest text-ink">
          {caseLabel}
        </span>
        <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-risk">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-risk" />
          </span>
          LIVE
        </div>
      </div>
    </header>
  );
}
