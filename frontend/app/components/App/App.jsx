import React from "react";
import Editor from "../Editor/Editor";
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import './App.css';
import Home from "../Home/Home";

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Router>
            <div>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/document/someThing">Document</Link></li>
                </ul>

                <hr/>

                <Route exact path="/" component={Home}/>
                <Route path="/document/:id" component={Editor}/>
            </div>
        </Router>
    }
}
