const fetch = require("node-fetch");
const {saveJsonToFile} = require("./fs");
const {map, flatMap, lift, id, tap, path, path2, put, compose, delay} = require("./fp");


const fetchWithRetry = async (url, attempts = 5) => {
  while (true) {
    try {
      const resp = await fetch(url);

      if (resp.status !== 200) {
        if (attempts-- === 0) {
          return resp;
        }

        console.log('retry', url);

        await delay(1000);

        continue;
      }

      return resp;
    } catch (e) {
      if (attempts-- === 0) {
        throw e;
      }

      console.log('retry', url);

      await delay(1000);
    }
  }
};

const fetchJson = (url) => fetchWithRetry(url).then(r => r.json());
const fetchHtml = (url) => fetchWithRetry(url).then(r => r.text());

const loaders = {
  loadCategories: () => fetchJson("https://stats.fn.sportradar.com/sportpesa/en/Europe:Berlin/gismo/config_tree/41/0/1"),
  loadTournaments: catId => fetchJson(`https://stats.fn.sportradar.com/sportpesa/en/Europe:Berlin/gismo/config_tree/41/0/1/${catId}`),
  loadTeams: tourId => fetchJson(`https://stats.fn.sportradar.com/sportpesa/en/Europe:Moscow/gismo/stats_formtable/${tourId}`),
  loadTeam: (tourId, team1) => fetchHtml(`https://s5.sir.sportradar.com/sportpesa/en/1/season/${tourId}/team/${team1}`),
};

const dataPath = ['doc', 0, 'data'];
const realcategoriesPath = [...dataPath, 0, 'realcategories'];
const tournamentsPath = [...realcategoriesPath, 0, 'tournaments'];
const teamsPath = [...dataPath, 'teams'];

const extractRealcategories = path(['doc', 0, 'data', 0, 'realcategories']);
const extractSrTournaments = path(tournamentsPath);
const extractSrTeams = path(teamsPath);

// SystemCategory {name: string, id: number}
// SystemTournament {name: string, id: number, catgoryId: number}

// SrCat => SystemCat
const convertRealcategoriesToSystemCategory = v => ({name: v.name, id: v._id});

// SrTournament => SystemTournaments

// extract only current tournament
const convertSrTournamentToSystem = v => ({name: v.name, id: v.currentseason, categoryId: v._rcid});

const convertSrTeamToSystemTeam = v => ({name: v.name, id: v.uid});

const getId = path(['id']);

const extractCategories = compose(
  extractRealcategories,
  map(convertRealcategoriesToSystemCategory)
);

const extractTournament = compose(
  extractSrTournaments,
  tournaments => tournaments.filter(it => it.seasontypename === "Regular Season" && !it.groupname),
  map(convertSrTournamentToSystem)
);

const extractTeams = compose(
  extractSrTeams,
  map(path(['team'])),
  map(convertSrTeamToSystemTeam)
);

const teamPairs = (tournamentId, team) => ([tournamentId, team]);

//
const extractTournamentTeamPairs = lift(teamPairs)(
  path([...dataPath, 'season', '_id']),
  extractTeams
);

const extractInitialState = page => JSON.parse(page.match(/__INITIAL_STATE__=(.*?)$/m)[1]);

const extractMatches = lift(path2)(
  compose(
    path(['routing', 'params', 'season']),
    season => ['fetchedData', `stats_season_fixtures2/${season}/1`, 'data', 'matches'],
  ),
  id
);

const extractMatch = v => ({
  id: v._id,
  home: v.teams.home.uid,
  away: v.teams.away.uid,
  score: {home: v.result.home, away: v.result.away},
  time: v.time.uts * 1000
});

const extractAllMatches = compose(
  extractInitialState,
  extractMatches,
  map(extractMatch),
);

const extractPairTournamentMatch = ([tournamentId, page]) => [
  tournamentId,
  extractAllMatches(page)
];

const buildTree = (categories, tournaments, teams, matches) => {
  const tree = {};

  categories.forEach(c => put([c.id], {...c, tournaments: {}}, tree));

  tournaments = tournaments.map(t => ({...t, teams: [], matches: []}));

  const tournamentMap = tournaments.reduce((m, t) => ({...m, [t.id]: t}), {});

  teams.forEach(([tournamentId, teams]) =>
    put([tournamentId, 'teams'], teams, tournamentMap)
  );

  matches.forEach(([tournamentId, matches]) =>
    put([tournamentId, 'matches'], matches, tournamentMap)
  );

  tournaments.forEach(t => put([t.categoryId, 'tournaments', t.id], t, tree));

  return tree;
};

const main = async () => {
  const categories = await loaders.loadCategories().then(extractCategories);

  // const allowedCat = [1, 30, 32];

  const tournaments = await Promise
    .all(
      categories.map(getId)
        // .filter(id => allowedCat.includes(id))
        .map(loaders.loadTournaments)
    )
    .then(map(extractTournament))
    .then(flatMap)
  ;

  const teams = await Promise
    .all(
      tournaments.map(getId).map(loaders.loadTeams)
    )
    .then(map(extractTournamentTeamPairs))
    // remove empty
    .then(teams => teams.filter(([id]) => Boolean(id)))
  ;

  // now load html page for one team and extract all played matches in this tournament

  // Matches = [ Pair(tournamentId, [Match]) ]
  const matches = await Promise
    // [{id}] take first team and extract id
    .all(
      teams
        .map(([tournamentId, [{id}]]) =>
          loaders.loadTeam(tournamentId, id).then(page => [tournamentId, page])
        )
    )
    .then(map(extractPairTournamentMatch))
  ;

  const tree = buildTree(categories, tournaments, teams, matches);

  saveJsonToFile('tree', tree);

  console.log('done');

  return tree;
};

main().catch(console.error);