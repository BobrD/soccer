import {isNil} from "../backend/fp";
import React from "react";
import {Ptc} from "./Ptc.jsx";


export const Probability = ({home, away, draw}) => {
  if (isNil(home)) {
    return 'N/A';
  }

  return <>
    <Ptc normal={home}/> <Ptc normal={draw}/> <Ptc normal={away}/>
  </>;
};