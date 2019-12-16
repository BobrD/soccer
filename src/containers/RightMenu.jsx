import {useSelector} from "react-redux";
import {selectMenuTree} from "../store/selector";
import {Link} from "react-router-dom";
import React from "react";
import classes from "./rightMenu.css";

export const RightMenu = () => {
  const tree = useSelector(selectMenuTree);

  return <ul className={classes.menu}>
    {
      tree.map(cat =>
        <li key={cat.id}>
          {cat.name}
          <ul>
            {
              cat.tournaments.map(({id, name}) =>
                <li key={id}>
                  <Link to={`/tournament/${id}`}>{name}</Link>
                </li>
              )
            }
          </ul>
        </li>
      )
    }
  </ul>
};