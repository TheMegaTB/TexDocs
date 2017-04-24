// Load react stuff
import React from "react";
import {render} from "react-dom";
import {target} from "./const";

import './main.css';

// Load redux bits and bobs
import {applyMiddleware, createStore} from "redux";
import promiseMiddleware from 'redux-promise';
import {logger} from "./redux/middleware";
import texDocsApp from './redux/reducers';

// Load components
import App from "./components/App/App";
import {Provider} from "react-redux";
import {MuiThemeProvider} from "material-ui";

// Load and execute material-ui dependency (needed for onTouchTap)
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const store = createStore(texDocsApp, applyMiddleware(promiseMiddleware, logger));

render(
    <Provider store={store}>
        <MuiThemeProvider>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    target
);
