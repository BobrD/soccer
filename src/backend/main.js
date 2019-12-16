const {poisson} = require("./poisson");

const reverseSide = side => side === 'home' ? 'away' : 'home';

const createTableForTeam = (matches, teamId, side) => {
  const table = {conceded: 0, captured: 0, avgConceded: 0, avgCaptured: 0, matches: 0, teamId};

  const reversedSide = reverseSide(side);

  // all matches where team was home or away
  const playedMatches = matches.filter(it => it[side] === teamId);

  if (playedMatches.length < 3) {
    return table;
  }

  table.matches = playedMatches.length;
  playedMatches.forEach(({score}) => {
    table.conceded += score[reversedSide];
    table.captured += score[side];
  });
  table.avgConceded = table.conceded / table.matches;
  table.avgCaptured = table.captured / table.matches;

  return table;
};

const totalForObject = fields => items => items.reduce((total, i) => {
  fields.forEach(field => {
    total[field] = (total[field] || 0) + i[field]
  });

  return total;
}, {});


const tableFields = ['conceded', 'captured', 'avgConceded', 'avgCaptured', 'matches'];

const computeAvgAndTotalForGoalTable = (table) => {
  const total = totalForObject(tableFields)(Object.values(table));

  const countTeams = Object.keys(table).length;

  const avg = {};
  tableFields.forEach(field => avg[field] = total[field] / countTeams);

  return {avg, total};
};

const computeStrength = (teamRow, avg) => {
  teamRow.attack = teamRow.avgCaptured / avg.avgCaptured;
  teamRow.defence = teamRow.avgConceded / avg.avgConceded;
};

const scoreRange = [0, 1, 2, 3, 4, 5];

const drawWin = score => {
  const [home, away] = score.split(':');

  return home === away;
};

const homeWin = score => {
  const [home, away] = score.split(':');

  return home > away;
};

const awayWin = score => {
  const [home, away] = score.split(':');

  return home < away;
};

const computeProb = filter => matrix => Object.entries(matrix)
  .filter(([score]) => filter(score))
  .map(([_, prob]) => prob)
  .reduce((total, i) => total + i, 0)
;

const drawProb = computeProb(drawWin);
const homeProb = computeProb(homeWin);
const awayProb = computeProb(awayWin);

const createGoalTable = (teams, matchesBefore, side) => {
  const goalTable = {};
  teams.forEach(({id}) => {
    goalTable[id] = createTableForTeam(matchesBefore, id, side)
  });

  const {avg, total} = computeAvgAndTotalForGoalTable(goalTable);

  Object.values(goalTable).forEach(teamRow => computeStrength(teamRow, avg));

  return {goalTable, avg, total}
};

const computeMatrix = (homeXG, awayXG) => {
  const matrix = {};
  scoreRange.forEach(home => {
    scoreRange.forEach(away => {
      matrix[`${home}:${away}`] = poisson(home, homeXG) * poisson(away, awayXG);
    });
  });

  return matrix;
};

const computeForMatch = (teams, matchesBefore, home, away) => {
  const {goalTable: homeTable, avg: avgHome, total: homeTotal} = createGoalTable(teams, matchesBefore, 'home');
  const {goalTable: awayTable, avg: avgAway, total: awayTotal} = createGoalTable(teams, matchesBefore, 'away');

  if (!awayTable[away] || !homeTable[home]) {
    return undefined;
  }

  // for match
  const homeXG = homeTable[home].attack * awayTable[away].defence * avgHome.avgCaptured;
  const awayXG = awayTable[away].attack * homeTable[home].defence * avgAway.avgCaptured;

  const matrix = computeMatrix(homeXG, awayXG);

  return {
    probability: {
      draw: drawProb(matrix),
      home: homeProb(matrix),
      away: awayProb(matrix)
    },
    homeXG,
    awayXG,
    matrix,
    home: {goalTable: homeTable, avg: avgHome, total: homeTotal},
    away: {goalTable: awayTable, avg: avgAway, total: awayTotal}
  }
};

module.exports = {computeForMatch};
