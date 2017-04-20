import React from "react";
import NoDocumentPopup from "../NoDocumentPopup/NoDocumentPopup";
import FilePicker from "../FilePicker/FilePicker";
import {AppBar} from "material-ui";

import './Home.css';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <AppBar
                title="TexDocs"
                style={{backgroundColor: '#FF5722'}}
            />
            <div className="picker-container">
                <FilePicker/>
            </div>
            {/*<NoDocumentPopup history={this.props.history} title="No document opened." text="Choose one of the following options to get started."/>*/}
        </div>;
    }
}
