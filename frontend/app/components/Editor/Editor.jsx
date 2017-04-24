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
        return (
            <div>
                <EditorMenubar/>
                <div style={{height: 'calc(100% - 68px)'}}>
                    <EditorToolbar/>
                    <div style={{height: 'calc(100% - 48px - 68px)'}}>
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
            </div>
        );
    }
}

Editor.propTypes = {
    googleAPI: React.PropTypes.object.isRequired
};

export default connect(
    (state) => { return { googleAPI: state.googleAPI } }
)(Editor);
