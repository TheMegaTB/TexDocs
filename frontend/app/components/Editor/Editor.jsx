import React, {Component, PropTypes} from "react";
import EditorContent from "./EditorContent/EditorContent";
import {loadDocument} from "../../api/google";
import {Map} from "immutable";
import {connect} from "react-redux";
import Loader from "../Loader/Loader";
import EditorToolbar from "./EditorToolbar/EditorToolbar";
import {Paper} from "material-ui";
import EditorMenubar from "./EditorMenubar/EditorMenubar";
import {Scrollbars} from "react-custom-scrollbars";
import SplitPane from "react-split-pane";

import "./Editor.css";
import PDFView from "./PDFView/PDFView";

class Editor extends Component {
    componentWillMount() {
        const editor = this;
        const store = this.context.store;
        const documentID = this.props.match.params.id;
        loadDocument(store, documentID, (doc) => {
            editor.document = doc;
        });
    }

    render() {
        const documentID = this.props.match.params.id;
        const docState = this.props.docState;
        const attributes = docState.get('attributes');
        const collaborators = this.document ? this.document.getCollaborators() : [];
        return (
            <div>
                <EditorMenubar docID={documentID} collaborators={collaborators}/>
                <div style={{background: '#eee', height: 'calc(100% - 68px)'}}>
                    <EditorToolbar/>
                    <div style={{height: 'calc(100% - 48px - 68px)'}}>
                        <SplitPane defaultSize="50%">
                            <div>
                                <Scrollbars
                                    style={{height: '100%'}}
                                    // This will activate auto hide
                                    autoHide
                                    // Hide delay in ms
                                    autoHideTimeout={1000}
                                    // Duration for hide animation in ms.
                                    autoHideDuration={200}
                                >
                                    {this.document && docState.get('loaded')
                                        ? <Paper className="paper" zDepth={2}><EditorContent document={this.document}
                                                                                             sID={docState.get('sessionID')}/></Paper>
                                        : <Loader text="Loading document"/>}
                                </Scrollbars>
                            </div>
                            <div>
                                <PDFView pdf="/static/output/Math.pdf"/>
                            </div>
                        </SplitPane>
                    </div>
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
