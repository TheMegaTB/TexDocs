import React, { Component, PropTypes } from 'react';
import EditorContent from "./EditorContent/EditorContent";
import {loadDocument, loadDocumentMetadata} from "../../api/google";
import { Map } from 'immutable';
import {connect} from "react-redux";
import Loader from "../Loader/Loader";
import EditorToolbar from "./EditorToolbar/EditorToolbar";
import {Paper} from "material-ui";
import EditorMenubar from "./EditorMenubar/EditorMenubar";

class Editor extends Component {
    componentWillMount() {
        const editor = this;
        const store = this.context.store;
        const documentID = this.props.match.params.id;
        loadDocument(store, documentID, (doc) => editor.document = doc);
    }

    render() {
        const documentID = this.props.match.params.id;
        const docState = this.props.docState;
        const attributes = docState.get('attributes');
        return (
            <div>
                <EditorMenubar docID={documentID} />
                <div style={{background: '#eee', height: '100%'}}>
                    <EditorToolbar/>
                    <Paper style={{margin: '20 auto', padding: 20, maxWidth: '800px'}} zDepth={2}>
                        {docState.get('loaded')
                            ? <EditorContent document={this.document} />
                            : <Loader text="Loading document" />}
                    </Paper>
                </div>
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
