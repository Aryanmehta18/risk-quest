import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { criteria, criteriaScores } from "../../data/criteria";

export default function TeamRadar({ team, teams }) {
  const data = criteria.map((c, i) => ({
    criterion: c,
    value: criteriaScores[team.id]?.[i] ?? 0,
    avg: +(teams.reduce((s, t) => s + (criteriaScores[t.id]?.[i] ?? 0), 0) / teams.length).toFixed(1),
  }));
  return (
    <div>
      <div className="flex items-center justify-center gap-4 text-xs">
        <span className="font-display text-base font-bold" style={{ color: team.color }}>
          {team.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          <span style={{ color: team.color }}>━</span> team &nbsp; <span>┅</span> field average
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} outerRadius="70%">
          <defs>
            <radialGradient id="radarFill">
              <stop offset="0%" stopColor={team.color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={team.color} stopOpacity={0.6} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="criterion" tick={{ fill: "#e9eef7", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar dataKey="avg" stroke="#7c89a3" strokeDasharray="4 4" fill="none" animationDuration={900} />
          <Radar
            dataKey="value"
            stroke={team.color}
            strokeWidth={2.5}
            fill="url(#radarFill)"
            style={{ filter: `drop-shadow(0 0 8px ${team.color}99)` }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}