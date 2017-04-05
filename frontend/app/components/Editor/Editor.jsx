import React, { Component, PropTypes } from 'react';
import EditorContent from "./EditorContent/EditorContent";
import {loadDocument} from "../../api/google";
import { Map } from 'immutable';
import {connect} from "react-redux";
import Loader from "../Loader/Loader";

class Editor extends Component {
    componentWillMount() {
        const editor = this;
        loadDocument(this.context.store, this.props.match.params.id, (doc) => {
            editor.document = doc;
        });
    }

    render() {
        return (
            <div>
                {this.props.docState.get('loaded')
                    ? <EditorContent document={this.document} />
                    : <Loader text="Loading document" />}
            </div>
        );
    }
}

Editor.contextTypes = {
    store: React.PropTypes.object
};

Editor.propTypes = {
    docState: PropTypes.instanceOf(Map).isRequired
};

function mapStateToProps(state) {
    return {
        docState: state
    };
}

export default connect(
    mapStateToProps
)(Editor);
