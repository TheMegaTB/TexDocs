import React, {Component, PropTypes} from "react";
import {loadDocumentMetadata} from "../../../api/google";
import {Map} from "immutable";
import {connect} from "react-redux";
import {FlatButton} from "material-ui";
import Icon from "material-ui/svg-icons/action/list";

import Popover, {PopoverAnimationVertical} from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";


import "./menubar.css";

const menuBarFontStyle = {
    fontSize: 13,
    color: '#757575'
};

const EditorButton = (props) =>
    <FlatButton onTouchTap={props.onTouchTap} style={{height: '32px', lineHeight: '32px', minWidth: '45px'}}
                label={props.label} labelStyle={Object.assign({textTransform: 'capitalize'}, menuBarFontStyle)}/>;

const TexDocsButton = () =>
    <div className="tex-docs-button">
        <Icon color='white' style={{width: '60%', height: '100%'}}/>
    </div>;

class Editor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

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
                        <div className="menubar-buttons">
                            <EditorButton label="File" onTouchTap={this.handleTouchTap}/>
                            <Popover
                                open={this.state.open}
                                anchorEl={this.state.anchorEl}
                                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                                onRequestClose={this.handleRequestClose}
                                animation={PopoverAnimationVertical}
                                useLayerForClickAway={false}
                            >
                                <Menu desktop={true} width={256}>
                                    <MenuItem primaryText="Open" secondaryText="&#8984;O"/>
                                    <MenuItem primaryText="Paste in place" secondaryText="&#8679;&#8984;V"/>
                                    <MenuItem primaryText="Research" secondaryText="&#8997;&#8679;&#8984;I"/>
                                </Menu>
                            </Popover>
                            <EditorButton label="Edit"/>
                            <EditorButton label="View"/>
                            <EditorButton label="Insert"/>
                            <EditorButton label="Format"/>
                            <EditorButton label="Tools"/>
                            <EditorButton label="Table"/>
                            <EditorButton label="Add-ons"/>
                            <EditorButton label="Help"/>
                            <span className="last-edit" style={menuBarFontStyle}>{attributes.get('lastEdit')}</span>
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
