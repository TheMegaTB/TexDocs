import React from 'react';

// Load theme and store providers
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Load components
import App from "./components/App/App";
import Authentication from "./components/Authentication/Authentication";

// Load API functions
import {authorize} from './api/google';
import {render} from "react-dom";
import {target} from './const';
import { createStore } from 'redux';
import state from './api/reducers';
import injectTapEventPlugin from 'react-tap-event-plugin';

function registerTapListener() {
    // Needed for onTouchTap
    // http://stackoverflow.com/a/34015469/988941
    injectTapEventPlugin();
}

const store = createStore(state);
const onAuthorized = render.bind(null, <Provider store={store}><App /></Provider>, target);
const onAuthFail = (auth) =>
    render(
        <MuiThemeProvider>
            <Authentication callback={auth}/>
        </MuiThemeProvider>,
        target
    );

export default function init() {
    registerTapListener();

    // Run the google drive authentication and respond to it.
    authorize(onAuthorized, onAuthFail);
}
