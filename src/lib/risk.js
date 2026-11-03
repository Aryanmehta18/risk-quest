// Risk level follows the league table, so it changes every time scores change:
// top 2 teams = LOW, bottom 2 teams = HIGH, everyone in between = MED.
// (With 4 or fewer teams still in play: top 2 LOW, the rest HIGH.)
export function withRisk(ranked) {
  const active = ranked.filter((t) => !t.eliminatedAfter);
  const n = active.length;
  const level = new Map();
  active.forEach((t, i) => level.set(t.id, i < 2 ? "safe" : i >= n - 2 ? "high" : "moderate"));
  return ranked.map((t) => ({ ...t, riskLevel: level.get(t.id) ?? t.riskLevel }));
}
