import React, {Component, PropTypes} from "react";
import {loadDocument} from "../../api/google";
import {Map} from "immutable";
import {connect} from "react-redux";
import Loader from "../Loader/Loader";
import EditorToolbar from "./EditorToolbar/EditorToolbar";
import EditorMenubar from "./EditorMenubar/EditorMenubar";
import SplitPane from "react-split-pane";

import "./Editor.css";
import TexRenderer from "./TexRenderer/TexRenderer";
import AceEditorContent from "./AceEditorContent/AceEditorContent";
import {registerKeybindings} from "../../api/keybindings";

class Editor extends Component {
    constructor(args) {
        super(args);

        this.state = {
            loaded: false,
            document: undefined
        }
    }

    getChildContext() {
        return {document: this.state.document};
    }

    updateDocument = () => {
        this.setState({ loaded: false, document: undefined });
        const editor = this;
        const store = this.context.store;
        const documentID = this.props.match.params.id;
        loadDocument(store, documentID, (doc) => {
            editor.setState({ loaded: true, document: doc });
        });
    };

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.updateDocument();
        }
    }

    componentDidMount() {
        this.updateDocument();
        registerKeybindings(document, this.context.router.history);
    }

    render() {
        const documentID = this.props.match.params.id;
        const docState = this.props.docState;
        const attributes = docState.get('attributes');
        const collaborators = this.state.document ? this.state.document.getCollaborators() : [];
        return (
            <div>
                <EditorMenubar docID={documentID} collaborators={collaborators}/>
                <div style={{height: 'calc(100% - 68px)'}}>
                    <EditorToolbar/>
                    <div style={{height: 'calc(100% - 48px - 68px)'}}>
                        <SplitPane defaultSize="50%">
                            <div>
                                {this.state.document
                                    ? <AceEditorContent document={this.state.document} sID={docState.get('sessionID')}/>
                                    : <Loader text="Loading document"/>}
                            </div>
                            <div>
                                <TexRenderer document={this.state.document} docID={documentID}/>
                            </div>
                        </SplitPane>
                    </div>
                </div>
            </div>
        );
    }
}

Editor.childContextTypes = {
    document: React.PropTypes.any
};

Editor.contextTypes = {
    store: React.PropTypes.object,
    router: React.PropTypes.object
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
