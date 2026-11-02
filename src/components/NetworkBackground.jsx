import { useEffect, useRef } from "react";

const N = 56;
const HUBS = 9;

export default function NetworkBackground({ onStat }) {
  const ref = useRef(null);
  const statRef = useRef(onStat);
  statRef.current = onStat;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let spark = 1500; // ms until the next random infection
    let shock = 9000; // ms until the next systemic shock
    let lastPct = -1;
    let lastStatAt = 0;
    const pulses = [];
    const waves = [];

    const nodes = Array.from({ length: N }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.000018,
      vy: (Math.random() - 0.5) * 0.000018,
      r: i < HUBS ? 3.6 : 1.8 + Math.random() * 1.2,
      hub: i < HUBS,
      inf: 0,
      id: String(10 + i),
      px: 0,
      py: 0,
    }));

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const infect = (n, level = 0.95) => {
      n.inf = Math.max(n.inf, level);
    };

    const frame = (now) => {
      const dt = Math.min(60, now - last);
      last = now;
      const step = reduce ? 0 : dt;
      const link = Math.min(w, h) * 0.22;

      ctx.clearRect(0, 0, w, h);

      // move + heal
      for (const n of nodes) {
        n.x += n.vx * step;
        n.y += n.vy * step;
        if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
        if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
        n.inf = Math.max(0, n.inf - step * 0.00009);
        n.px = n.x * w;
        n.py = n.y * h;
      }

      // random infections
      spark -= step;
      if (spark <= 0) {
        const healthy = nodes.filter((n) => n.inf < 0.1);
        if (healthy.length) infect(healthy[Math.floor(Math.random() * healthy.length)]);
        spark = 2200 + Math.random() * 2800;
      }

      // systemic shock: a hub goes down and a red wave rolls out
      shock -= step;
      if (shock <= 0) {
        const hub = nodes[Math.floor(Math.random() * HUBS)];
        infect(hub, 1);
        nodes
          .filter((n) => n !== hub)
          .sort(
            (a, b) =>
              Math.hypot(a.px - hub.px, a.py - hub.py) - Math.hypot(b.px - hub.px, b.py - hub.py)
          )
          .slice(0, 3)
          .forEach((n) => infect(n, 0.9));
        waves.push({ x: hub.px, y: hub.py, t: 0 });
        shock = 24000 + Math.random() * 10000;
      }

      // edges + contagion spread
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.px - b.px, a.py - b.py);
          if (d >= link) continue;

          const near = 1 - d / link;
          const e = Math.max(a.inf, b.inf);
          ctx.lineWidth = e > 0.05 ? 1.4 : 1;
          ctx.strokeStyle =
            e > 0.05
              ? `rgba(255,59,87,${near * (0.25 + e * 0.6)})`
              : `rgba(58,160,255,${near * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();

          const hot = a.inf > 0.55 ? a : b.inf > 0.55 ? b : null;
          const cold = hot === a ? b : a;
          if (hot && cold.inf < 0.2 && Math.random() < step * 0.0005 * near) {
            infect(cold, 0.9);
            pulses.push({ a: hot, b: cold, t: 0 });
          }
        }
      }

      // pulses travelling along infected links
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        p.t += step * 0.0014;
        if (p.t >= 1) {
          pulses.splice(k, 1);
          continue;
        }
        const x = p.a.px + (p.b.px - p.a.px) * p.t;
        const y = p.a.py + (p.b.py - p.a.py) * p.t;
        ctx.save();
        ctx.shadowColor = "rgba(255,59,87,1)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#FF3B57";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // shock waves
      for (let k = waves.length - 1; k >= 0; k--) {
        const wv = waves[k];
        wv.t += step * 0.00045;
        if (wv.t >= 1) {
          waves.splice(k, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255,59,87,${(1 - wv.t) * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.t * Math.max(w, h) * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // nodes
      ctx.font = "10px 'JetBrains Mono', monospace";
      let infected = 0;
      for (const n of nodes) {
        if (n.inf > 0.3) infected++;
        const sick = n.inf > 0.05;

        if (n.inf > 0.7) {
          ctx.strokeStyle = `rgba(255,59,87,${n.inf * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(n.px, n.py, 4 + (1 - n.inf) * 60, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.save();
        if (sick) {
          ctx.shadowColor = "rgba(255,59,87,1)";
          ctx.shadowBlur = 12;
          ctx.fillStyle = `rgba(255,59,87,${0.55 + 0.45 * n.inf})`;
        } else {
          ctx.fillStyle = n.hub ? "rgba(255,174,31,0.9)" : "rgba(58,160,255,0.7)";
        }
        ctx.beginPath();
        ctx.arc(n.px, n.py, n.r + (sick ? n.inf * 1.6 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (n.hub) {
          ctx.fillStyle = "rgba(233,238,247,0.4)";
          ctx.fillText(`CPTY-${n.id}`, n.px + 8, n.py - 7);
        }
      }

      // report the contagion index (throttled)
      const pct = Math.round((infected / N) * 100);
      if (pct !== lastPct && now - lastStatAt > 500) {
        lastPct = pct;
        lastStatAt = now;
        statRef.current?.(pct);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}