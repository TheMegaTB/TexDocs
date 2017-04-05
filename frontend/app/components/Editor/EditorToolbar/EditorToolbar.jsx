import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import Printer from 'material-ui/svg-icons/maps/local-printshop';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';
import TextFormat from 'material-ui/svg-icons/content/text-format';

const iconStyle = {color: 'rgba(0, 0, 0, 0.7)', width: 21, height: 21};
const iconButtonStyle = {width: 28, height: 28, padding: '0 20px'};

export default class ToolbarExamplesSimple extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: 3,
        };
    }

    handleChange = (event, index, value) => this.setState({value});

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
                    {/*<DropDownMenu value={this.state.value} onChange={this.handleChange}>*/}
                        {/*<MenuItem value={1} primaryText="All Broadcasts" />*/}
                        {/*<MenuItem value={2} primaryText="All Voice" />*/}
                        {/*<MenuItem value={3} primaryText="All Text" />*/}
                        {/*<MenuItem value={4} primaryText="Complete Voice" />*/}
                        {/*<MenuItem value={5} primaryText="Complete Text" />*/}
                        {/*<MenuItem value={6} primaryText="Active Voice" />*/}
                        {/*<MenuItem value={7} primaryText="Active Text" />*/}
                    {/*</DropDownMenu>*/}
                </ToolbarGroup>
                {/*<ToolbarGroup>*/}
                    {/*<ToolbarTitle text="Options" />*/}
                    {/*<FontIcon className="muidocs-icon-custom-sort" />*/}
                    {/*<ToolbarSeparator />*/}
                    {/*<RaisedButton label="Create Broadcast" primary={true} />*/}
                    {/*<IconMenu*/}
                        {/*iconButtonElement={*/}
                            {/*<IconButton touch={true}>*/}
                                {/*<NavigationExpandMoreIcon />*/}
                            {/*</IconButton>*/}
                        {/*}*/}
                    {/*>*/}
                        {/*<MenuItem primaryText="Download" />*/}
                        {/*<MenuItem primaryText="More Info" />*/}
                    {/*</IconMenu>*/}
                {/*</ToolbarGroup>*/}
            </Toolbar>
        );
    }
}
