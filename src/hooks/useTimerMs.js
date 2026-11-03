import { useEffect, useState } from "react";

// Two laptops never have exactly the same clock. The admin writes "ends at <admin clock time>",
// so a dashboard whose clock is 15 s behind used to show 15 s too much.
// Fix: when a start/resume arrives live, count down from the moment it arrives using
// the length the admin chose (remainingMs). Device clocks are then irrelevant.
const KEY = "rq-clock-offset";
const readOffset = () => {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
};
const saveOffset = (v) => {
  try { localStorage.setItem(KEY, String(Math.round(v))); } catch { /* ignore */ }
};

let booted = false; // false only until the first render after the page opens
let lastKey = null;
let lastEnd = 0;

function localEndFor(timer) {
  if (timer.endsAt === lastKey) return lastEnd; // every component shares the same anchor
  let end;
  if (!booted) {
    // page opened (or refreshed) while a timer was already running: use the clock
    // difference learned from an earlier live start, if any
    end = timer.endsAt + readOffset();
  } else {
    end = Date.now() + timer.remainingMs;
    saveOffset(end - timer.endsAt);
  }
  lastKey = timer.endsAt;
  lastEnd = end;
  return end;
}

export function useTimerMs(timer, tickMs = 200) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  useEffect(() => {
    booted = true; // after the first render, any new start/resume counts as a live event
  }, []);

  const end = timer.status === "running" ? localEndFor(timer) : null;
  const ms = end === null ? Math.max(0, timer.remainingMs) : Math.max(0, end - now);
  return { ms, end, now };
}
