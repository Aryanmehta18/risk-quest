export const teams = [
  { id: "t1", name: "Black Swan",  members: ["Member 1", "Member 2", "Member 3"], color: "#FF2E4D", score: 130, prevRank: 1, streak: 2, riskLevel: "high",     powerUps: ["shield", "double", "steal"], history: [40, 85, 130] },
  { id: "t2", name: "Red Alert",   members: ["Member 1", "Member 2", "Member 3"], color: "#FF6B4A", score: 118, prevRank: 3, streak: 3, riskLevel: "moderate", powerUps: ["shield", "double", "steal"], history: [35, 70, 118] },
  { id: "t3", name: "Hedge Hogs",  members: ["Member 1", "Member 2", "Member 3"], color: "#FFC83D", score: 105, prevRank: 2, streak: 0, riskLevel: "safe",     powerUps: ["shield", "double", "steal"], history: [50, 80, 105] },
  { id: "t4", name: "Stress Test", members: ["Member 1", "Member 2", "Member 3"], color: "#FFE066", score: 98,  prevRank: 5, streak: 1, riskLevel: "high",     powerUps: ["shield", "double", "steal"], history: [20, 60, 98] },
  { id: "t5", name: "Tail Risk",   members: ["Member 1", "Member 2", "Member 3"], color: "#2F8CFF", score: 90,  prevRank: 4, streak: 0, riskLevel: "moderate", powerUps: ["shield", "double", "steal"], history: [45, 65, 90] },
  { id: "t6", name: "Blue Chip",   members: ["Member 1", "Member 2", "Member 3"], color: "#5CC8FF", score: 84,  prevRank: 6, streak: 0, riskLevel: "safe",     powerUps: ["shield", "double", "steal"], history: [30, 55, 84] },
  { id: "t7", name: "Margin Call", members: ["Member 1", "Member 2", "Member 3"], color: "#7A6CFF", score: 72,  prevRank: 8, streak: 1, riskLevel: "high",     powerUps: ["shield", "double", "steal"], history: [25, 40, 72] },
  { id: "t8", name: "Safe Harbor", members: ["Member 1", "Member 2", "Member 3"], color: "#FF5C8A", score: 60,  prevRank: 7, streak: 0, riskLevel: "safe",     powerUps: ["shield", "double", "steal"], history: [38, 50, 60] },
];

export const rounds = [
  { id: "r1", caseTitle: "Case 1 title", company: "Company A", status: "done" },
  { id: "r2", caseTitle: "Case 2 title", company: "Company B", status: "live" },
  { id: "r3", caseTitle: "Case 3 title", company: "Company C", status: "upcoming" },
];

export const events = [
  { id: "e1", type: "score",    teamId: "t1", points: 45,  message: "Black Swan +45 pts",             timestamp: 1 },
  { id: "e2", type: "penalty",  teamId: "t3", points: -10, message: "Hedge Hogs −10 pts (risk failed)", timestamp: 2 },
  { id: "e4", type: "score",    teamId: "t2", points: 48,  message: "Red Alert +48 pts",              timestamp: 4 },
];