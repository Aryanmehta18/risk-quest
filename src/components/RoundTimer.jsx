import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const R = 54;
const C = 2 * Math.PI * R;

export default function RoundTimer({ timer }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const running = timer.status === "running";
  const ms = Math.max(0, running ? timer.endsAt - now : timer.remainingMs);
  const remaining = Math.ceil(ms / 1000);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = Math.min(100, (ms / Math.max(1, (timer.durationSec || 1) * 1000)) * 100);

  const color = remaining > 120 ? "text-signal" : remaining > 30 ? "text-gold" : "text-risk";
  const pulse = running && remaining > 0 && remaining <= 30 ? "animate-pulse" : "";
  const heading =
    timer.status === "paused" ? "Paused" : timer.status === "idle" ? "Round ready" : "Time remaining";

  return (
    <div className="rounded-xl border border-edge bg-surface p-5">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 128 128" className={`h-28 w-28 shrink-0 -rotate-90 ${color}`}>
          <circle
            cx="64"
            cy="64"
            r="62"
            fill="none"
            stroke="#1E2838"
            strokeWidth="3"
            strokeDasharray="1.5 4.59"
          />
          <circle cx="64" cy="64" r={R} fill="none" stroke="#1E2838" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
            style={{ filter: "drop-shadow(0 0 6px currentColor)", transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">{heading}</p>
          <p
            className={`mt-1 font-mono text-5xl font-bold tabular-nums [text-shadow:0_0_18px_currentColor] ${color} ${pulse}`}
          >
            {pad(mins)}:{pad(secs)}
          </p>
        </div>
      </div>
    </div>
  );
}