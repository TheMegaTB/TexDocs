import React from "react";
import {render} from "react-dom";
import {target} from "./const";
import init from "./init";

import './main.css';

// Load components
import Loader from "./components/Loader/Loader";
import {applyMiddleware, createStore} from "redux";
import promiseMiddleware from 'redux-promise';
import texDocsApp from './redux/editor/reducers';
import {Provider} from "react-redux";
import App from "./components/App/App";
import {MuiThemeProvider} from "material-ui";

init();

const logger = store => next => action => {
    console.log('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    return result
};

const store = createStore(texDocsApp, applyMiddleware(promiseMiddleware, logger));

// render(<Loader text="Initializing TexDocs"/>, target);
render(
    <Provider store={store}>
        <MuiThemeProvider>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    target
);
