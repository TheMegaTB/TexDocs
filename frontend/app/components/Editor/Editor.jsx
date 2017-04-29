import React, {Component} from "react";
import {connect} from "react-redux";
import EditorToolbar from "./EditorToolbar/EditorToolbar";
import EditorMenubar from "./EditorMenubar/EditorMenubar";
import SplitPane from "react-split-pane";

import "./Editor.css";
import TexRenderer from "./TexRenderer/TexRenderer";
import EditorContent from "./EditorContent/EditorContent";
import {loadDocumentMetadata, loadRealtimeDocument} from "../../redux/actions/editor/files";

class Editor extends Component {
    updateDocument = () => {
        const documentID = this.props.match.params.id;
        if (documentID) {
            const api = this.props.googleAPI.get('api');
            const dispatch = this.props.dispatch;
            dispatch(loadRealtimeDocument(api.realtime, documentID, dispatch));
            dispatch(loadDocumentMetadata(api.client, documentID));
        }
    };

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.updateDocument();
        }
    }

    componentDidMount() {
        this.updateDocument();
    }

    render() {
        const menubar = this.props.mode === 'full';
        const toolbar = this.props.mode !== 'minimal';

        const contentHeight = `calc(100% ${menubar ?'- 68px':''} ${toolbar?'- 48px':''})`;

        return (
            <div>
                <EditorMenubar collapsed={!menubar} />
                <EditorToolbar collapsed={!toolbar} />
                    <div style={{height: contentHeight}}>
                        <SplitPane defaultSize="50%">
                            <div>
                                <EditorContent/>
                            </div>
                            <div>
                                <TexRenderer/>
                            </div>
                        </SplitPane>
                    </div>
            </div>
        );
    }
}

Editor.propTypes = {
    googleAPI: React.PropTypes.object.isRequired,
    mode: React.PropTypes.string.isRequired
};

export default connect(
    (state) => { return {
        googleAPI: state.googleAPI,
        mode: state.editor.texEditor.get('mode')
    } }
)(Editor);
