import {render} from "react-dom";
import React from "react";
import {createStore} from "redux";
import {Provider} from "react-redux";
import {createRootReducer} from "./utils/reduxUtils.js";
import {App} from "./containers/App.jsx";
import {initialState} from "./store/initialState.js";
import {
    BrowserRouter as Router,
} from "react-router-dom";

const root = document.getElementById('root');

const store = createStore(
    createRootReducer(
        []
    ),
    initialState
);


render(
    <Provider store={store}>
        <Router>
            <App/>
        </Router>
    </Provider>,
    root
);