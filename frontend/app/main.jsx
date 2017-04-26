// Load react stuff
import React from "react";
import {render} from "react-dom";
import {target} from "./const";

import './main.css';

// Load redux bits and bobs
import {applyMiddleware, createStore} from "redux";
import promiseMiddleware from 'redux-promise';
import {editor, logger} from "./redux/middleware";
import texDocsApp from './redux/reducers';

// Load components
import App from "./components/App/App";
import {Provider} from "react-redux";
import {MuiThemeProvider} from "material-ui";

// Load and execute material-ui dependency (needed for onTouchTap)
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Load a global PDFJS worker so that the file does not get fetched EVERY time a PDF is rendered
import pdfjsLib from "pdfjs-dist";
pdfjsLib.PDFJS.workerSrc = `/pdf.worker.js`;
window.pdfWorker = new pdfjsLib.PDFWorker();

const store = createStore(texDocsApp, applyMiddleware(promiseMiddleware, logger, editor));

render(
    <Provider store={store}>
        <MuiThemeProvider>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    target
);
