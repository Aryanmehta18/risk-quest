import { useRef } from "react";
import { motion } from "framer-motion";
import FormattedContext from "./FormattedContext";
import { useFitText } from "../hooks/useFitText";
import { useTimerMs } from "../hooks/useTimerMs";

const pad = (n) => String(n).padStart(2, "0");

// A− / A+ in admin now sets the BIGGEST the text may be (in px).
// The text then shrinks automatically if the question is too long for the screen.
const CONTEXT_MAX_PX = [26, 34, 44, 56];

export default function FocusView({ round, qIndex, timer, size = 1 }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  const running = timer.status === "running";
  const { ms } = useTimerMs(timer, 250);
  const remaining = Math.ceil(ms / 1000);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const color = remaining > 120 ? "text-signal" : remaining > 30 ? "text-gold" : "text-risk";
  const bar = remaining > 120 ? "bg-signal" : remaining > 30 ? "bg-gold" : "bg-risk";
  const pulse = running && remaining > 0 && remaining <= 30 ? "animate-pulse" : "";
  const pct = Math.min(100, (ms / Math.max(1, (timer.durationSec || 1) * 1000)) * 100);

  const heading =
    running && remaining === 0
      ? "Time's up"
      : timer.status === "paused"
        ? "Paused"
        : timer.status === "idle"
          ? "Get ready"
          : "Time remaining";

  const questions = round?.questions || [];
  const q = questions[qIndex];

  // fits the question text to whatever screen this is shown on
  const maxPx = CONTEXT_MAX_PX[size] ?? CONTEXT_MAX_PX[1];
  useFitText(boxRef, textRef, [q?.context, qIndex], { min: 13, max: maxPx });

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-void px-[3vw] py-[3vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex shrink-0 items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-risk">● Live case</p>
          <p
            className="mt-1 font-display font-black text-gold"
            style={{ fontSize: "clamp(1.5rem, 4.5vh, 2.25rem)" }}
          >
            {round?.caseTitle}
          </p>
          <p className="text-mute">{round?.company}</p>
          <p className="mt-2 inline-block rounded-full bg-signal/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-signal">
            Question {qIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-[0.4em] text-mute">{heading}</p>
          <p
            className={`font-display font-black leading-none tabular-nums ${color} ${pulse}`}
            style={{ fontSize: "clamp(2.75rem, 11vh, 4.5rem)" }}
          >
            {pad(mins)}:{pad(secs)}
          </p>
        </div>
      </div>

      <div className="mt-[2vh] h-1.5 w-full shrink-0 rounded-full bg-edge">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-linear ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* The question panel takes all remaining height. The inner box is what the text is fitted to. */}
      <div className="relative mt-[2vh] min-h-0 flex-1 rounded-2xl border border-edge bg-surface">
        <div
          ref={boxRef}
          className="absolute inset-x-[2.5vw] inset-y-[2.5vh] flex flex-col overflow-y-auto"
        >
          <FormattedContext
            ref={textRef}
            text={q?.context}
            columns={1}
            className="my-auto w-full shrink-0"
          />
        </div>
      </div>
    </motion.div>
  );
}
