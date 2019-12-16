import {isNil} from "../backend/fp";
import React from "react";

const ScoreValue = ({score}) => isNil(score) ? '-' : score;

export const Score = ({score: {home, away}}) => (
  <>
    <ScoreValue score={home}/>
    :
    <ScoreValue score={away}/>
  </>
);
