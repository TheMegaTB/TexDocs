import React from "react";
import LatexEditor from "../Editor/Editor";

require('./App.css');

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <LatexEditor/>;
    }
}
