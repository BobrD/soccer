import {createSelector} from "reselect";
import {
  selectAllMatchesInTournaments, selectProbabilityMapByTournament,
  selectTeamsMapByTournament,
  selectTournament,
  sortMatchesByTimeAsk
} from "../store/selector";
import {useParams} from "react-router";
import {useSelector} from "react-redux";
import React from "react";
import {isNil} from "../backend/fp";
import classes from "./tournament.css";
import {Link} from "react-router-dom";
import {Date} from "../components/Date.jsx";
import {Score} from "../components/Score.jsx";
import {Probability} from "../components/Probability.jsx";

const tournamentSelector = tournamentId => createSelector(
  selectAllMatchesInTournaments(tournamentId),
  selectTournament(tournamentId),
  selectTeamsMapByTournament(tournamentId),
  selectProbabilityMapByTournament(tournamentId),

  (matches, tournament, teams, probability) => {
    return {
      ...tournament,
      matches: sortMatchesByTimeAsk(matches),
      teams,
      probability
    }
  }
);


const winnerByProbability = (probability) => {
  const {home, draw, away} = probability;

  if (home > draw && home > away) {
    return {home: true};
  }

  if (draw > home && draw > away) {
    return {draw: true};
  }

  if (away > home && away > draw) {
    return {away: true};
  }
};

const getClassForEvent = (score, probability = {}) => {
  if (isNil(score.home) || isNil(probability.draw)) {
    return "";
  }

  const {home, away, draw} = winnerByProbability(probability);

  // draw
  if (score.home === score.away && draw) {
    return classes.true
  }

  // home
  if (score.home > score.away && home) {
    return classes.true
  }

  // away
  if (score.home < score.away && away) {
    return classes.true
  }

  return classes.false
};

export const Tournament = () => {

  let {tournamentId} = useParams();

  tournamentId = parseInt(tournamentId, 10);

  const {name, teams, matches, probability} = useSelector(tournamentSelector(tournamentId));

  return (
    <div>
      <h1>{name}</h1>
      <table>
        <thead>
        <tr>
          <td>name</td>
          <td>time</td>
          <td>score</td>
          <td>probability (home draw away)</td>
        </tr>
        </thead>

        <tbody>
        {
          matches.map(({home, away, time, score, id}) =>
            <tr key={id} className={getClassForEvent(score, probability[id])}>
              <td>
                <Link to={`/match/${id}`}>
                  {(teams[home] || {}).name} - {(teams[away] || {}).name}
                </Link>
              </td>
              <td><Date timestamp={time}/></td>
              <td><Score score={score}/></td>
              <td><Probability {...probability[id]}/></td>
            </tr>
          )
        }
        </tbody>
      </table>
    </div>
  )
};
