import React from "react";
import {Route, Switch} from "react-router-dom";
import {useRouteMatch} from "react-router";
import {Tournament} from "./Tournament.jsx";
import {RightMenu} from "./RightMenu.jsx";
import {Match} from "./Match.jsx";
import classes from "./app.css";

export const App = () => {

  useRouteMatch();

  return <div style={{display: 'flex'}}>
    <RightMenu/>
    <div className={classes.leftBlock}>
      <Switch>
        <Route path={'/tournament/:tournamentId'}>
          <Tournament/>
        </Route>
        <Route path={'/match/:matchId'}>
          <Match />
        </Route>
      </Switch>
    </div>

  </div>
};