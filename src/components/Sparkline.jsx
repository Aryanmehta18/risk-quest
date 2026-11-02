import { useId } from "react";
import { motion } from "framer-motion";

const W = 96;
const H = 34;

export default function Sparkline({ values, max }) {
  const gid = useId();
  if (values.length < 2) return <div />;

  const lo = Math.min(0, ...values);
  const hi = Math.max(1, max, ...values);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (W - 6) + 3,
    H - 4 - ((v - lo) / span) * (H - 8),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  const [lx, ly] = pts[pts.length - 1];
  const rising = values[values.length - 1] >= values[values.length - 2];
  const stroke = rising ? "#FFAE1F" : "#FF3B57";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-full overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <motion.path
        key={line}
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <circle cx={lx} cy={ly} r="2.6" fill={stroke} />
      <motion.circle
        cx={lx}
        cy={ly}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        initial={{ r: 2.6, opacity: 0.8 }}
        animate={{ r: 8, opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );
}