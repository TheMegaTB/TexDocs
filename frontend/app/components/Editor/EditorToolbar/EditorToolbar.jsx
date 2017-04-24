import React from 'react';
import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar';
import Printer from 'material-ui/svg-icons/maps/local-printshop';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';
import TextFormat from 'material-ui/svg-icons/content/text-format';

const iconStyle = {color: 'rgba(0, 0, 0, 0.7)', width: 21, height: 21};
const iconButtonStyle = {width: 28, height: 28, padding: '0 20px'};

export default class EditorToolbar extends React.Component {
    render() {
        return (
            <Toolbar style={{background: '#f1f1f1', height: 48}}>
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
            </Toolbar>
        );
    }
}
