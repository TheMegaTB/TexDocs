import React, {Component, PropTypes} from "react";
import Editor from "../Editor/Editor";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Map} from "immutable";

import "./App.css";
import Home from "../Home/Home";

import {connect} from "react-redux";
import {authorize, authorized, initGAPI, loadGAPI, registerTokenRefresher} from "../../redux/actions/gapi";
import Loader from "../Loader/Loader";
import Authorize from "./Authorize";

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

    componentDidUpdate() {
        this.dispatchActions();
    }

    componentDidMount() {
        this.dispatchActions();
    }

    render() {
        const googleAPI = this.props.googleAPI;

        const apiLoaded = googleAPI.has('api');
        const apiInitialized = googleAPI.has('gAuth');
        const apiAuthorized = googleAPI.has('user');

        const auth2 = googleAPI.has('api') ? googleAPI.get('api').auth2 : undefined;
        const gAuth = googleAPI.get('gAuth');
        const accessToken = googleAPI.get('accessToken');

        if (!apiLoaded)
            return <Loader text="Loading Google API"/>;
        else if (!apiInitialized)
            return <Loader text="Initializing Google API"/>;
        else if (!apiAuthorized && gAuth.isSignedIn.get())
            return <Loader text="Authorizing TexDocs"/>;
        else if (!apiAuthorized)
            return <Authorize onAuthClick={() => this.props.dispatch(authorize(auth2, gAuth))}/>;
        else if (!accessToken)
            return <Loader text="Authenticating TexDocs"/>;

        return (
            <Router>
                <div>
                    <Route exact path="/" component={Home}/>
                    <Route path="/d/:id" component={Editor}/>
                </div>
            </Router>
        );
    }
}

App.propTypes = {
    googleAPI: PropTypes.instanceOf(Map).isRequired
};

export default connect(
    (state) => { return { googleAPI: state.googleAPI } }
)(App);
