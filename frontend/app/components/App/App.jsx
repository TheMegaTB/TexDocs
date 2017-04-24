import React from "react";
import Editor from "../Editor/Editor";
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./App.css";
import Home from "../Home/Home";
import {history} from '../../init';

import {connect} from "react-redux";
import {authorize, authorized, initGAPI, loadGAPI, registerTokenRefresher} from "../../redux/editor/actions/gapi";
import Loader from "../Loader/Loader";
import Authorize from "./Authorize";

class App extends React.Component {
    dispatchActions = () => {
        const state = this.props.appState;
        const store = this.context.store;

        const apiLoaded = state.googleAPI.has('api');
        const apiInitialized = state.googleAPI.has('gAuth');
        const apiAuthorized = state.googleAPI.has('user');

        const auth2 = state.googleAPI.has('api') ? state.googleAPI.get('api').auth2 : undefined;
        const auth = state.googleAPI.has('api') ? state.googleAPI.get('api').auth : undefined;
        const gAuth = state.googleAPI.get('gAuth');

        if (!apiLoaded)
            store.dispatch(loadGAPI());
        else if (!apiInitialized)
            store.dispatch(initGAPI(auth2));
        else if (!apiAuthorized && gAuth.isSignedIn.get())
            store.dispatch(authorized(gAuth));
        else if (apiAuthorized && gAuth.isSignedIn.get() && !state.googleAPI.has('tokenRefresher'))
            store.dispatch(registerTokenRefresher(auth, store));
    };

    componentDidUpdate() {
        this.dispatchActions();
    }

    componentDidMount() {
        this.dispatchActions();
    }

    render() {
        const state = this.props.appState;

        const apiLoaded = state.googleAPI.has('api');
        const apiInitialized = state.googleAPI.has('gAuth');
        const apiAuthorized = state.googleAPI.has('user');

        const auth2 = state.googleAPI.has('api') ? state.googleAPI.get('api').auth2 : undefined;
        const gAuth = state.googleAPI.get('gAuth');
        const accessToken = state.googleAPI.get('accessToken');

        if (!apiLoaded)
            return <Loader text="Loading Google API"/>;
        else if (!apiInitialized)
            return <Loader text="Initializing Google API"/>;
        else if (!apiAuthorized && gAuth.isSignedIn.get())
            return <Loader text="Authorizing TexDocs"/>;
        else if (!apiAuthorized)
            return <Authorize onAuthClick={() => this.context.store.dispatch(authorize(auth2, gAuth))}/>;
        else if (!accessToken)
            return <Loader text="Authenticating TexDocs"/>;

        return (
            <Router history={history}>
                <div>
                    <Route exact path="/" component={Home}/>
                    <Route path="/d/:id" component={Editor}/>
                </div>
            </Router>
        );
    }
}

App.contextTypes = {
    store: React.PropTypes.object
};

App.propTypes = {
    appState: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        appState: state
    };
}

export default connect(
    mapStateToProps
)(App);
