import React from "react";
import Editor from "../Editor/Editor";
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./App.css";
import Home from "../Home/Home";
import {MuiThemeProvider} from "material-ui";

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <MuiThemeProvider>
                    <div>
                        {/*<ul>*/}
                            {/*<li><Link to="/">Home</Link></li>*/}
                            {/*<li><Link to="/d/someThing">Document</Link></li>*/}
                        {/*</ul>*/}

                        {/*<hr/>*/}

                        <Route exact path="/" component={Home}/>
                        <Route path="/d/:id" component={Editor}/>
                    </div>
                </MuiThemeProvider>
            </Router>
        );
    }
}
