const {saveToFile} = require("./fs");
const path = require("path");
const {path2} = require("./fp");
const {computeForMatch} = require("./main");
const {readJsonFromFile} = require("./fs");

const someZero = probability => Object.values(probability).some(v => v < 0.01);
const someNaN = probability => Object.values(probability).some(v => isNaN(v));

const createProbabilityTable = (data) => {
  const tournaments = path2([1, 'tournaments'], data);

  const resultMap = {};

  Object.values(data).forEach(cat =>
    Object.values(cat.tournaments).forEach(tournament => {
      const {matches, teams} = tournament;

      matches.forEach(match => {

        const matchesBefore = matches.filter(it => it.time < match.time);

        const resultForMatch = computeForMatch(teams, matchesBefore, match.home, match.away);

        if (! resultForMatch) {
          return;
        }

        const {probability} = resultForMatch;

        if (someZero(probability) || someNaN(probability)) {
          return;
        }

        resultMap[match.id] = probability;
      });
    })
  );

  return resultMap;
};

const byId = arr => {
  const map = {};
  for (const i of arr) map[i.id] = i;

  return map;
};

const buildInitialState = () => {
  const data = readJsonFromFile('tree');

  const state = {
    // map by id
    categories: [
      // {name, id}
    ],

    // map by id
    tournaments: [
      // {name, id, categoryId}
    ],

    // map by id
    matches: [
      // {id, tournamentId, score: {home, away}, home, away}
    ],

    // map by id
    teams: [
      // {name, id}
    ],
  };

  Object.values(data).forEach(c => {
    state.categories.push({
      id: c.id,
      name: c.name
    });

    Object.values(c.tournaments).forEach(({name, id, categoryId, teams, matches}) => {
      state.tournaments.push({name, id, categoryId});

      matches.forEach(m => {
        state.matches.push({...m, tournamentId: id})
      });

      state.teams.push(...teams);
    })
  });

  const initialState = {
    categories: byId(state.categories),
    tournaments: byId(state.tournaments),
    matches: byId(state.matches),
    teams: byId(state.teams),
    probability: createProbabilityTable(data)
  };

  saveToFile(
    path.resolve(__dirname, '../store/initialState.js'),
    `
export const initialState = ${JSON.stringify(initialState, null, 2)}
  `)
};

buildInitialState();