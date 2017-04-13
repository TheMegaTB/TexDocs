import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import {createDocument, openDocument} from '../../../../api/google';

import {FlatButton} from "material-ui";
import Popover, {PopoverAnimationVertical} from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import {NEW_DOC_NAME} from "../../../../const";

const menuBarFontStyle = {
    fontSize: 13,
    color: '#757575'
};

const EditorButton = (props) =>
    <FlatButton onTouchTap={props.onTouchTap} style={{height: '32px', lineHeight: '32px', minWidth: '45px'}}
                label={props.label} labelStyle={Object.assign({textTransform: 'capitalize'}, menuBarFontStyle)}/>;

class EditorMenubarControls extends Component {
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

    onFileOpen = () => {
        this.handleRequestClose();
        openDocument(this.context.router.history);
    };

    onFileCreate = () => {
        this.handleRequestClose();
        createDocument(NEW_DOC_NAME, this.context.router.history);
    };

    render() {
        const docState = this.props.docState;
        const attributes = docState.get('attributes');
        return (
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
                        <MenuItem primaryText="New" onTouchTap={this.onFileCreate}/>
                        <MenuItem primaryText="Open" secondaryText="&#8984;O" onTouchTap={this.onFileOpen}/>
                        {/*<MenuItem primaryText="Paste in place" secondaryText="&#8679;&#8984;V"/>*/}
                        {/*<MenuItem primaryText="Research" secondaryText="&#8997;&#8679;&#8984;I"/>*/}
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
        );
    }
}

EditorMenubarControls.contextTypes = {
    store: React.PropTypes.object,
    router: React.PropTypes.object
};

EditorMenubarControls.propTypes = {
    docState: PropTypes.any
};

function mapStateToProps(state) {
    return {
        docState: state
    };
}

export default connect(
    mapStateToProps
)(EditorMenubarControls);
