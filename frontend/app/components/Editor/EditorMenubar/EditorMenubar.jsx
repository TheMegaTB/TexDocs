import React, {Component, PropTypes} from "react";
import {loadDocumentMetadata} from "../../../api/google";
import {Map} from "immutable";
import {connect} from "react-redux";
import {FlatButton} from "material-ui";
import Icon from "material-ui/svg-icons/action/list";
import Share from 'material-ui/svg-icons/social/share';
import ExpandMore from 'material-ui/svg-icons/navigation/arrow-drop-down';
import {fullWhite} from 'material-ui/styles/colors';


import "./EditorMenubar.css";
import EditorMenubarControls from "./EditorMenubarControls/EditorMenubarControls";

const TexDocsButton = () =>
    <div className="tex-docs-button">
        <Icon color='white' style={{width: '60%', height: '100%'}}/>
    </div>;

class EditorMenubar extends Component {
    loadMetadata = () => {
        // TODO Check
        loadDocumentMetadata(this.context.store, this.props.docID);
    };

    componentDidUpdate(prevProps) {
        if (prevProps.docID !== this.props.docID && this.props.docID) {
            this.loadMetadata();
        }
    }

    componentWillMount() {
        this.loadMetadata();
    }

    render() {
        const docState = this.props.docState;
        const metadata = docState.get('metadata');
        const ids = [];
        const collaborators = this.props.collaborators.filter((collaborator) => {
            for (let id in ids)
                if (ids.hasOwnProperty(id) && ids[id] === collaborator.userId) return false;
            ids.push(collaborator.userId);
            return true;
        });
        return (
            <div className="menubar">
                <TexDocsButton/>
                <div className="container">
                    <div>
                        <div>
                            <span className="menubar-title">{metadata.get('name')}</span>
                        </div>
                        <div className="puush"/>
                    </div>
                    <div>
                        <div className="puush"/>
                        <div className="menubar-bottom">
                            <EditorMenubarControls/>
                        </div>
                    </div>
                </div>
                <div className="container" style={{marginLeft: 'auto'}}>
                    <div>
                        <FlatButton
                            label={docState.get('user').get('email')}
                            labelPosition="before"
                            labelStyle={{textTransform: 'lowercase', fontSize: 10}}
                            style={{height: '20px', lineHeight: '20px'}}
                            icon={<ExpandMore />}
                        />
                        <div className="puush" />
                    </div>
                    <div style={{justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 5, marginRight: 24}}>
                        <div className="puush"/>
                        <div className="menubar-collaborators">
                            {collaborators.map((collaborator) => {
                                if (!collaborator.isMe)
                                    return <div className="collaborator" key={collaborator.sessionId} >
                                        <div className="crop">
                                            <img src={collaborator.photoUrl}/>
                                        </div>
                                        <div className="color-bar" style={{backgroundColor: collaborator.color}}/>
                                    </div>;
                            })}
                        </div>
                        <FlatButton
                            backgroundColor="#4D90FE"
                            hoverColor="#42A5F5"
                            icon={<Share color={fullWhite} />}
                            labelStyle={{fontSize: 13}}
                            style={{height: '29px', lineHeight: '29px', minWidth: '78px', color: fullWhite, whiteSpace: 'nowrap', display: 'inline-block'}}
                            label="Share"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

EditorMenubar.contextTypes = {
    store: React.PropTypes.object
};

EditorMenubar.propTypes = {
    docState: PropTypes.instanceOf(Map).isRequired
};

function mapStateToProps(state) {
    return {
        docState: state
    };
}

export default connect(
    mapStateToProps
)(EditorMenubar);
