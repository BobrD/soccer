export const selectMenuTree = state => Object.values(state.categories).map(category => ({
  ...category,
  tournaments: selectTournamentsForCategory(category.id)(state)
}));

export const selectMatch = matchId => state => state.matches[matchId];

export const selectTeamsInMatch = matchId => state => ({
  home: selectTeam(selectMatch(matchId)(state).home)(state),
  away: selectTeam(selectMatch(matchId)(state).away)(state),
});

const selectTournamentsForCategory = categoryId => state => Object.values(state.tournaments).filter(c => c.categoryId === categoryId);

export const selectTournament = tournamentId => state => state.tournaments[tournamentId];

export const selectAllMatchesInTournaments = tournamentId => state =>
  Object.values(state.matches).filter(it => it.tournamentId === tournamentId)
;

const safeSort = (fn, items) => [...items].sort(fn);

export const sortMatchesByTimeAsk = matches => safeSort(
  (a, b) => b.time - a.time,
  matches
);

export const selectTeam = teamId => state => state.teams[teamId];

export const selectTeamsMapByTournament = tournamentId => state => selectAllMatchesInTournaments(tournamentId)(state)
  .reduce((map, match) => ({
    ...map,
    [match.home]: selectTeam(match.home)(state),
    [match.away]: selectTeam(match.away)(state),
  }), {});

export const selectProbabilityByMatch = matchId => state => state.probability[matchId];

export const selectProbabilityMapByTournament = tournamentId => state =>
  selectAllMatchesInTournaments(tournamentId)(state)
    .reduce((map, {id}) => ({...map, [id]: state.probability[id]}), {})
;