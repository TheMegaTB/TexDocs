import React, { Component, PropTypes } from 'react';
import {loadDocumentMetadata} from "../../../api/google";
import { Map } from 'immutable';
import {connect} from "react-redux";
import {FlatButton} from "material-ui";
import Icon from "material-ui/svg-icons/action/list";

import './menubar.css';

const menuBarFontStyle = {
    fontSize: 13,
    color: '#757575'
};

const EditorButton = (props) =>
    <FlatButton style={{height: '32px', lineHeight: '32px', minWidth: '45px'}} label={props.label} labelStyle={Object.assign({textTransform: 'capitalize'}, menuBarFontStyle)}/>;

const TexDocsButton = () =>
    <div className="tex-docs-button">
        <Icon color='white' style={{width: '60%', height: '100%'}}/>
    </div>;

class Editor extends Component {
    componentWillMount() {
        loadDocumentMetadata(this.context.store, this.props.docID);
    }

    render() {
        const docState = this.props.docState;
        const attributes = docState.get('attributes');
        return (
            <div className="menubar">
                <TexDocsButton/>
                <div className="container">
                    <div>
                        <div>
                            <span className="menubar-title">{attributes.get('title')}</span>
                        </div>
                        <div className="puush"/>
                    </div>
                    <div>
                        <div className="puush"/>
                        <div>
                            <EditorButton label="File"/>
                            <EditorButton label="Edit"/>
                            <EditorButton label="View"/>
                            <EditorButton label="Insert"/>
                            <EditorButton label="Format"/>
                            <EditorButton label="Tools"/>
                            <EditorButton label="Table"/>
                            <EditorButton label="Add-ons"/>
                            <EditorButton label="Help"/>
                            <span style={Object.assign(menuBarFontStyle, {paddingLeft: 15})}>{attributes.get('lastEdit')}</span>
                        </div>
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
