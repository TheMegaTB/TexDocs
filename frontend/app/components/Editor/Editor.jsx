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
import {loadDocumentMetadata, loadRealtimeDocument} from "../../redux/actions/editor/files";

class Editor extends Component {
    constructor(args) {
        super(args);

        this.state = {
            loaded: false,
            document: undefined
        }
    }

    getChildContext() {
        return { document: this.state.document };
    }

    updateDocument = () => {
        const documentID = this.props.match.params.id;
        if (documentID) {
            const api = this.props.googleAPI.get('api');
            const store = this.context.store;
            store.dispatch(loadRealtimeDocument(api.realtime, documentID, store));
            store.dispatch(loadDocumentMetadata(api.client, documentID));
        }
    };

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.updateDocument();
        }
    }

    componentDidMount() {
        this.updateDocument();
        // registerKeybindings(document, this.context.router.history);
    }

    render() {
        const documentID = this.props.match.params.id;
        const docState = this.props.docState;

        const sessionID = '';
        return (
            <div>
                <EditorMenubar/>
                <div style={{height: 'calc(100% - 68px)'}}>
                    <EditorToolbar/>
                    <div style={{height: 'calc(100% - 48px - 68px)'}}>
                        <SplitPane defaultSize="50%">
                            <div>
                                <AceEditorContent/>
                                {/*{this.state.document*/}
                                    {/*? <AceEditorContent/>*/}
                                    {/*: <Loader text="Loading document"/>}*/}
                            </div>
                            <div>
                                <TexRenderer/>
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
    googleAPI: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        googleAPI: state.googleAPI
    };
}

export default connect(
    mapStateToProps
)(Editor);
