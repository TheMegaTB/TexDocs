import React from 'react';
import createHistory from 'history/createBrowserHistory';

// Load theme and store providers
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Load components
import App from "./components/App/App";

// Load API functions
import {authorize} from './api/google';
import {render} from "react-dom";
import {target} from './const';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Loader from "./components/Loader/Loader";
import {store} from "./api/reducers";
import {registerKeybindings} from "./api/keybindings";

function registerTapListener() {
    // Needed for onTouchTap
    // http://stackoverflow.com/a/34015469/988941
    injectTapEventPlugin();
}


const onAuthorized = render.bind(null, <Provider store={store}><App /></Provider>, target);
const onAuthFail = (auth) => {
    render(<Loader text="Authorizing TexDocs"/>, target);
    auth();
};

export const history = createHistory();

export default function init() {
    registerTapListener();

    // Run the google drive authentication and respond to it.
    authorize(store, onAuthorized, onAuthFail);
}
