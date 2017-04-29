import React from 'react';
import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar';
import Printer from 'material-ui/svg-icons/maps/local-printshop';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';
import TextFormat from 'material-ui/svg-icons/content/text-format';
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';

import './EditorToolbar.css';
import {toggleCompactEditor, toggleMinimalEditor} from "../../../redux/actions/editor/texEditor";
import {connect} from "react-redux";

const iconStyle = {color: 'rgba(0, 0, 0, 0.7)', width: 21, height: 21};
const iconButtonStyle = {width: 28, height: 28, padding: '0 20px'};

class EditorToolbar extends React.Component {
    toggleCompactMode = () => {
        window.fullmode = () => {
            this.props.dispatch(toggleMinimalEditor());
        };
        this.props.dispatch(toggleCompactEditor());
    };

    render() {
        return (
            <Toolbar className={this.props.collapsed ? "toolbar collapsed" : "toolbar"}>
                <ToolbarGroup firstChild={true}>
                    <IconButton tooltip="Print" iconStyle={iconStyle} style={iconButtonStyle}>
                        <Printer/>
                    </IconButton>
                    <IconButton tooltip="Undo" iconStyle={iconStyle} style={iconButtonStyle}>
                        <Undo/>
                    </IconButton>
                    <IconButton tooltip="Redo" iconStyle={iconStyle} style={iconButtonStyle}>
                        <Redo/>
                    </IconButton>
                    <ToolbarSeparator />
                    <IconButton tooltip="Formatting" iconStyle={iconStyle} style={iconButtonStyle}>
                        <TextFormat/>
                    </IconButton>
                </ToolbarGroup>
                <ToolbarGroup>
                    <IconButton tooltip="Compact editor" iconStyle={iconStyle} style={iconButtonStyle} onTouchTap={this.toggleCompactMode}>
                        {this.props.mode === 'full' ? <ExpandLess/> : <ExpandMore/>}
                    </IconButton>
                </ToolbarGroup>
            </Toolbar>
        );
    }
}

EditorToolbar.propTypes = {
    mode: React.PropTypes.string.isRequired
};

export default connect(
    (state) => { return {
        mode: state.editor.texEditor.get('mode')
    } }
)(EditorToolbar);
