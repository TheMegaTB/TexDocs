import React from "react";
import NoDocumentPopup from "../NoDocumentPopup/NoDocumentPopup";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <NoDocumentPopup history={this.props.history} title="No document opened." text="Choose one of the following options to get started."/>
        </div>;
    }
}
