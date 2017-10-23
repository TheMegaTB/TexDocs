import React, {Component, PropTypes} from "react";
import Editor from "../Editor/Editor";
// import {BrowserRouter as Router, Route} from "react-router-dom";
import { Router } from 'react-router';
import { Route } from 'react-router-dom';
import {Map} from "immutable";

import "./App.css";
import Home from "../Home/Home";

import {connect} from "react-redux";
import {authorize, authorized, initGAPI, loadGAPI, registerTokenRefresher} from "../../redux/actions/gapi";
import Loader from "../Loader/Loader";
import Authorize from "./Authorize";
import {createHistory} from "../../redux/actions/navigation";

class App extends Component {
    dispatchActions = () => {
        const googleAPI = this.props.googleAPI;
        const dispatch = this.props.dispatch;

        const apiLoaded = googleAPI.has('api');
        const apiInitialized = googleAPI.has('gAuth');
        const apiAuthorized = googleAPI.has('user');

        const auth2 = googleAPI.has('api') ? googleAPI.get('api').auth2 : undefined;
        const auth = googleAPI.has('api') ? googleAPI.get('api').auth : undefined;
        const gAuth = googleAPI.get('gAuth');

        if (!apiLoaded)
            dispatch(loadGAPI());
        else if (!apiInitialized)
            dispatch(initGAPI(auth2));
        else if (!apiAuthorized && gAuth.isSignedIn.get())
            dispatch(authorized(gAuth));
        else if (apiAuthorized && gAuth.isSignedIn.get() && !googleAPI.has('tokenRefresher'))
            dispatch(registerTokenRefresher(auth, dispatch));
    };

    componentDidUpdate(prevProps) {
        if (prevProps.history === this.props.history) this.dispatchActions();
    }

    componentDidMount() {
        this.dispatchActions();

        this.props.dispatch(createHistory());
    }

    render() {
        const googleAPI = this.props.googleAPI;

        const apiLoaded = googleAPI.has('api');
        const apiInitialized = googleAPI.has('gAuth');
        const apiAuthorized = googleAPI.has('user');

        const gAuth = googleAPI.get('gAuth');
        const accessToken = googleAPI.get('accessToken');

        console.log("gAuth", apiAuthorized, apiInitialized, apiLoaded, gAuth.isSignedIn.get(), gAuth);

        if (!apiLoaded)
            return <Loader text="Loading Google API"/>;
        else if (!apiInitialized)
            return <Loader text="Initializing Google API"/>;
        else if (!apiAuthorized && gAuth.isSignedIn.get())
            return <Loader text="Authorizing TexDocs"/>;
        else if (!apiAuthorized)
            return <Authorize onAuthClick={() => this.props.dispatch(authorize(gAuth))}/>;
        else if (!accessToken)
            return <Loader text="Authenticating TexDocs"/>;

        return (
            <Router history={this.props.history}>
                <div>
                    <Route exact path="/" component={Home}/>
                    <Route path="/d/:id" component={Editor}/>
                </div>
            </Router>
        );
    }
}

App.propTypes = {
    googleAPI: PropTypes.instanceOf(Map).isRequired,
    history: PropTypes.object
};

export default connect(
    (state) => { return {
        googleAPI: state.googleAPI,
        history: state.navigation.get('history')
    } }
)(App);
