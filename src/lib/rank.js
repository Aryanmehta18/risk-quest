export function rankTeams(teams) {
  const active = teams.filter((t) => !t.eliminatedAfter).sort((a, b) => b.score - a.score);
  const out = teams
    .filter((t) => t.eliminatedAfter)
    .sort((a, b) => b.eliminatedAfter - a.eliminatedAfter || b.score - a.score);

  return [...active, ...out].map((team, index) => ({
    ...team,
    rank: index + 1,
    delta: team.eliminatedAfter ? 0 : team.prevRank - (index + 1),
  }));
}