import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Tip({ active, payload, label, teams }) {
  if (!active || !payload?.length) return null;
  const rows = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="min-w-[170px] rounded-lg border border-white/10 bg-void/95 px-3 py-2 shadow-2xl backdrop-blur">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-mute">{label}</p>
      {rows.map((r, i) => (
        <div key={r.dataKey} className="flex items-center gap-2 py-0.5 text-xs">
          <span className="w-3 font-mono text-mute">{i + 1}</span>
          <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
          <span className="flex-1 text-ink">{teams.find((t) => t.id === r.dataKey)?.name}</span>
          <span className="font-mono font-bold text-gold">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// history = score after each finished round; last point = live score
export default function RaceChart({ teams, liveLabel, focusId }) {
  const done = teams[0].history.length;
  const rows = Array.from({ length: done + 1 }, (_, i) => {
    const row = { round: i < done ? `R${i + 1}` : liveLabel };
    teams.forEach((t) => (row[t.id] = i < done ? t.history[i] : t.score));
    return row;
  });
  // draw the spotlighted team last so it sits on top
  const order = [...teams].sort((a, b) => (a.id === focusId) - (b.id === focusId));

  return (
    <ResponsiveContainer width="100%" height={290}>
      <LineChart data={rows} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="round" stroke="#7c89a3" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke="#7c89a3" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          content={<Tip teams={teams} />}
          cursor={{ stroke: "rgba(255,174,31,0.4)", strokeDasharray: "4 4" }}
        />
        {order.map((t) => {
          const lead = t.rank === 1;
          const on = focusId === t.id;
          const dim = focusId && !on;
          return (
            <Line
              key={t.id}
              type="monotone"
              dataKey={t.id}
              stroke={t.color}
              strokeWidth={on ? 4.5 : lead ? 3.5 : 2}
              strokeOpacity={dim ? 0.12 : 1}
              style={{ filter: on || (lead && !focusId) ? `drop-shadow(0 0 6px ${t.color})` : "none" }}
              dot={({ cx, cy, index }) =>
                index === rows.length - 1 ? (
                  <g key={t.id}>
                    <circle cx={cx} cy={cy} r={9} fill={t.color} opacity={dim ? 0 : 0.25}>
                      <animate attributeName="r" values="4;11;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r={4} fill={t.color} opacity={dim ? 0.15 : 1} />
                  </g>
                ) : (
                  <g key={`${t.id}-${index}`} />
                )
              }
              activeDot={{ r: 5, stroke: "#020305", strokeWidth: 2 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}