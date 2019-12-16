export const appState = {
  // map by id
  categories: {
    // {name, id}
  },

  // map by id
  tournaments: {
    // {name, id, categoryId}
  },

  // map by id
  matches: {
    // {id, tournamentId, score: [number?, number?], home, away, time}
  },

  // map by id
  teams: {
    // {name, id}
  },

  // map where key is match id
  probability: {
    // {home, draw, away}
  }
};