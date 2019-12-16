import {useParams} from "react-router";
import React from "react";
import {useSelector} from "react-redux";
import {createSelector} from "reselect";
import {Date} from "../components/Date.jsx";
import {Probability} from "../components/Probability.jsx";
import {Score} from "../components/Score.jsx";
import {selectMatch, selectProbabilityByMatch, selectTeamsInMatch} from "../store/selector";
import {FixedNumber} from "../components/FixedNumber.jsx";
import {range} from "../backend/fp";

const useMatch = (matchId) => {
  const [data, setData] = React.useState(undefined);

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`http://${location.hostname}:8081/match/${matchId}`).then(r => r.json());

      setData(result);
    };

    fetchData();
  }, []);

  return data;
};

const matchSelector = matchId => createSelector(
  selectMatch(matchId),
  selectTeamsInMatch(matchId),
  selectProbabilityByMatch(matchId),

  (match, teams, probability) => ({
    ...match,
    ...teams,
    probability,
  })
);

const GoalTableHeadRow = () => <tr>
  <td>team</td>
  <td>matches</td>

  <td>captured</td>
  <td>avg captured</td>

  <td>conceded</td>
  <td>avg conceded</td>

  <td>attack</td>
  <td>defence</td>
</tr>;

const GoalTableRow = ({row, ...props}) => (
  <tr {...props}>
    <td>{row.teamId}</td>
    <td>{row.matches}</td>

    <td>{row.captured}</td>
    <td><FixedNumber number={row.avgCaptured}/></td>

    <td>{row.conceded}</td>
    <td><FixedNumber number={row.avgConceded}/></td>

    <td><FixedNumber number={row.attack}/></td>
    <td><FixedNumber number={row.defence}/></td>
  </tr>
);

const Matrix = ({matrix}) => {

  return <table>
    <thead>
    <tr>
      {
        [
          <td key={'Goals'}>Goals</td>,
          ...range(0, 5).map(i => <td key={i}>{i}</td>)
        ]
      }
    </tr>
    </thead>
    <tbody>
    {
      range(0, 5).map(i =>
        <tr key={i}>
          {
            [
              <td key={`y:${i}`}>{i}</td>,
              ...range(0, 5).map(j =>
                <td key={j}>
                  <FixedNumber number={matrix[`${i}:${j}`]}/>
                </td>
              )
            ]
          }
        </tr>
      )
    }
    </tbody>
  </table>
};

const GoalTableSide = ({table, side}) => (
  <table>
    <thead>
    <tr>
      <td>{side}</td>
    </tr>
    <GoalTableHeadRow/>
    </thead>
    <tbody>
    {
      Object.values(table).map(row => <GoalTableRow key={row.teamId} row={row}/>)
    }
    </tbody>
  </table>
);

const GoalTable = ({home, away}) => <div style={{display: 'flex'}}>
  <GoalTableSide key={"home"} table={home.goalTable} side={'home'}/>
  <GoalTableSide key={"away"} table={away.goalTable} side={'away'}/>
</div>;

export const Match = () => {
  let {matchId} = useParams();

  matchId = parseInt(matchId, 10);

  const data = useMatch(matchId);

  const {home, away, score, time, probability} = useSelector(matchSelector(matchId));

  if (!data) {
    return "loading";
  }

  const {homeXG, awayXG, matrix} = data;

  return <div>
    <h1>{home.name} - {away.name}</h1>
    <h3><Date timestamp={time}/></h3>
    <div>Score: <Score score={score}/></div>
    <div>Probability: <Probability {...probability}/></div>
    <div>Expected goals home: <FixedNumber number={homeXG}/> away <FixedNumber number={awayXG}/></div>

    <GoalTable home={data.home} away={data.away}/>
    <Matrix matrix={matrix}/>
  </div>
};