const express = require('express');
const cors = require('cors');
const {computeForMatch} = require("./main");
const {path2} = require("./fp");
const {readJsonFromFile} = require("./fs");
const app = express();

const data = readJsonFromFile('tree');

// map where key is match id and value is path
const matchesIndex = {};

Object.values(data).forEach(cat => {
  Object.values(cat.tournaments).forEach(tournament => {
    tournament.matches.forEach(match => {
      matchesIndex[match.id] = [cat.id, 'tournaments', tournament.id];
    })
  });
});


app.use(cors());

app.get('/match/:id', (req, res) => {
  const id = +req.params.id;

  const matchPath = matchesIndex[id];

  if (! matchPath) {
    res.status(404);

    res.send();

    return;
  }

  const {matches, teams} = path2(matchPath, data);

  const match = matches.find(it => it.id === id);

  const matchesBefore = matches.filter(it => it.time < match.time);

  const result = computeForMatch(teams, matchesBefore, match.home, match.away);

  if (! result) {
    res.status(404);

    res.send();

    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result));
});

app.get('/match', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(Object.keys(matchesIndex)));
});

app.listen(8081, function () {
  console.log('listening on port 8081')
});