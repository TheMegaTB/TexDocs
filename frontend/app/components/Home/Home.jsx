import React from "react";
import NoDocumentPopup from "../NoDocumentPopup/NoDocumentPopup";
import FilePicker from "../FilePicker/FilePicker";
import {AppBar} from "material-ui";

import './Home.css';
import {Sticky, StickyContainer} from "react-sticky";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <StickyContainer style={{backgroundColor: '#eee'}}>
            <Sticky onStickyStateChange={(e) => {console.log(e)}}>
                <AppBar
                    title="TexDocs"
                    style={{backgroundColor: '#FF5722'}}
                />
            </Sticky>
            <div className="content">
                <div className="template-picker">
                    Hey there!
                </div>
                <div className="picker-container">
                    <FilePicker/>
                </div>
            </div>
            {/*<NoDocumentPopup history={this.props.history} title="No document opened." text="Choose one of the following options to get started."/>*/}
        </StickyContainer>;
    }
}
