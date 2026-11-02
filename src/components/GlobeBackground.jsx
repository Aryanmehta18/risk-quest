import { useEffect, useRef } from "react";

// [name, latitude, longitude]
const CITIES = [
  ["NEW YORK", 40.71, -74.0],
  ["LONDON", 51.5, -0.12],
  ["FRANKFURT", 50.11, 8.68],
  ["DUBAI", 25.2, 55.27],
  ["MUMBAI", 19.07, 72.88],
  ["SINGAPORE", 1.35, 103.82],
  ["HONG KONG", 22.32, 114.17],
  ["TOKYO", 35.68, 139.69],
  ["SYDNEY", -33.87, 151.2],
  ["SAO PAULO", -23.55, -46.63],
  ["JOHANNESBURG", -26.2, 28.04],
  ["ZURICH", 47.37, 8.54],
];

// pairs of cities connected by an arc
const LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [0, 9], [1, 10], [4, 3], [5, 8], [2, 11], [11, 4], [6, 8], [9, 1],
];
// arcs that carry red "contagion" pulses instead of amber ones
const RISK_LINKS = new Set([1, 5, 9, 12]);

const TILT = 0.4;
const RING_TILT = -0.38;
const RING_SQUASH = 0.28;

const rad = (d) => (d * Math.PI) / 180;
const toVec = (lat, lon) => {
  const la = rad(lat);
  const lo = rad(lon);
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

function slerp(a, b, t, omega) {
  const s = Math.sin(omega);
  if (s < 1e-5) return a;
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

export default function GlobeBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;

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

    const cityVecs = CITIES.map(([, lat, lon]) => toVec(lat, lon));
    const links = LINKS.map(([a, b], i) => {
      const va = cityVecs[a];
      const vb = cityVecs[b];
      const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
      return { va, vb, omega: Math.acos(dot), risk: RISK_LINKS.has(i), i };
    });

    // rotate around the vertical axis, then tilt toward the viewer
    const project = (v, rot, cx, cy, R, lift = 1) => {
      const c = Math.cos(rot);
      const s = Math.sin(rot);
      const x = (v[0] * c + v[2] * s) * lift;
      const z0 = (-v[0] * s + v[2] * c) * lift;
      const y0 = v[1] * lift;
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const y = y0 * ct - z0 * st;
      const z = y0 * st + z0 * ct;
      return { x: cx + R * x, y: cy - R * y, z };
    };

    const arcPoint = (l, t) => {
      const base = slerp(l.va, l.vb, t, l.omega);
      const lift = 1 + (0.05 + 0.22 * (l.omega / Math.PI)) * Math.sin(Math.PI * t);
      return { base, lift };
    };

    const strokeLine = (pts) => {
      let pen = false;
      ctx.beginPath();
      for (const p of pts) {
        if (p.z > 0) {
          if (!pen) {
            ctx.moveTo(p.x, p.y);
            pen = true;
          } else ctx.lineTo(p.x, p.y);
        } else pen = false;
      }
      ctx.stroke();
    };

    const ringPoint = (a, cx, cy, R) => {
      const rx = R * 1.3;
      const ry = rx * RING_SQUASH;
      const x = rx * Math.cos(a);
      const y = ry * Math.sin(a);
      const ca = Math.cos(RING_TILT);
      const sa = Math.sin(RING_TILT);
      return { x: cx + x * ca - y * sa, y: cy + x * sa + y * ca };
    };

    const ringHalf = (from, to, cx, cy, R) => {
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const p = ringPoint(from + ((to - from) * k) / 60, cx, cy, R);
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    };

    const draw = (now) => {
      const time = reduce ? 0 : now;
      ctx.clearRect(0, 0, w, h);

      const R = Math.min(w, h) * 0.46;
      const cx = w * 0.7;
      const cy = h * 0.52;
      const rot = time * 0.00012;

      // far half of the orbit ring
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = "rgba(255,174,31,0.16)";
      ringHalf(Math.PI, Math.PI * 2, cx, cy, R);
      ctx.setLineDash([]);

      // atmosphere halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.22);
      halo.addColorStop(0, "rgba(255,174,31,0.13)");
      halo.addColorStop(1, "rgba(255,174,31,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(58,160,255,0.13)");
      body.addColorStop(1, "rgba(58,160,255,0.015)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = "rgba(255,174,31,0.6)";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "rgba(255,174,31,0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // graticule: latitudes, then longitudes
      ctx.lineWidth = 1;
      for (const lat of [-60, -30, 0, 30, 60]) {
        ctx.strokeStyle = lat === 0 ? "rgba(255,174,31,0.28)" : "rgba(58,160,255,0.16)";
        const pts = [];
        for (let lon = -180; lon <= 180; lon += 5) pts.push(project(toVec(lat, lon), rot, cx, cy, R));
        strokeLine(pts);
      }
      ctx.strokeStyle = "rgba(58,160,255,0.14)";
      for (let lon = 0; lon < 360; lon += 30) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 5) pts.push(project(toVec(lat, lon), rot, cx, cy, R));
        strokeLine(pts);
      }

      // arcs between financial centres, with travelling pulses
      for (const l of links) {
        const col = l.risk ? "255,59,87" : "255,174,31";

        ctx.strokeStyle = `rgba(${col},0.22)`;
        ctx.lineWidth = 1;
        const pts = [];
        for (let k = 0; k <= 48; k++) {
          const { base, lift } = arcPoint(l, k / 48);
          pts.push(project(base, rot, cx, cy, R, lift));
        }
        strokeLine(pts);

        const speed = 0.00026 * (0.7 + (l.i % 5) * 0.14);
        const p = (time * speed + l.i * 0.37) % 1;
        ctx.lineWidth = 2.2;
        for (let k = 0; k < 9; k++) {
          const t1 = p - (0.2 * (k + 1)) / 9;
          const t2 = p - (0.2 * k) / 9;
          if (t1 < 0) continue;
          const a1 = arcPoint(l, t1);
          const a2 = arcPoint(l, t2);
          const p1 = project(a1.base, rot, cx, cy, R, a1.lift);
          const p2 = project(a2.base, rot, cx, cy, R, a2.lift);
          if (p1.z <= 0 || p2.z <= 0) continue;
          ctx.strokeStyle = `rgba(${col},${(1 - k / 9) * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        const ah = arcPoint(l, p);
        const head = project(ah.base, rot, cx, cy, R, ah.lift);
        if (head.z > 0) {
          ctx.save();
          ctx.shadowColor = `rgba(${col},1)`;
          ctx.shadowBlur = 12;
          ctx.fillStyle = `rgb(${col})`;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // city nodes with ping rings and labels
      ctx.font = "11px 'JetBrains Mono', monospace";
      cityVecs.forEach((v, i) => {
        const pt = project(v, rot, cx, cy, R);
        if (pt.z <= 0) return;
        const hot = i === 4 || i === 0 || i === 1;
        const col = hot ? "255,174,31" : "58,160,255";

        const phase = (time * 0.0007 + i * 0.41) % 1;
        ctx.strokeStyle = `rgba(${col},${(1 - phase) * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 + phase * 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = `rgba(${col},1)`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgb(${col})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (pt.z > 0.25) {
          ctx.fillStyle = `rgba(233,238,247,${Math.min(1, pt.z) * 0.7})`;
          ctx.fillText(CITIES[i][0], pt.x + 9, pt.y - 8);
        }
      });

      // near half of the orbit ring + satellite
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = "rgba(255,174,31,0.3)";
      ringHalf(0, Math.PI, cx, cy, R);
      ctx.setLineDash([]);

      const sa = time * 0.0004;
      const sat = ringPoint(sa, cx, cy, R);
      ctx.save();
      ctx.globalAlpha = Math.sin(sa) > 0 ? 1 : 0.35;
      ctx.shadowColor = "rgba(255,174,31,1)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#FFAE1F";
      ctx.beginPath();
      ctx.arc(sat.x, sat.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}