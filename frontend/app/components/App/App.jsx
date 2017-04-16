import React from "react";
import Editor from "../Editor/Editor";
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./App.css";
import Home from "../Home/Home";
import {MuiThemeProvider} from "material-ui";
import {history} from '../../init';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router history={history}>
                <MuiThemeProvider>
                    <div>
                        <Route exact path="/" component={Home}/>
                        <Route path="/d/:id" component={Editor}/>
                    </div>
                </MuiThemeProvider>
            </Router>
        );
    }
}
