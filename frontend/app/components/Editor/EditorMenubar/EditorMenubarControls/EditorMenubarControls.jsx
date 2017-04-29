import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import {Map} from 'immutable';

// API Functions / helpers / constants
import {NEW_DOC_NAME} from "../../../../const";
import {downloadPDF, downloadTex, printPDF} from "../../../../redux/actions/editor/files";
import {insertImage, redo, undo} from "../../../../redux/actions/editor/texEditor";
import {createFile, openDashboard} from "../../../../redux/actions/navigation";

// Material-UI
import {Divider, FlatButton} from "material-ui";
import Popover, {PopoverAnimationVertical} from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";

// Icons
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Printer from 'material-ui/svg-icons/maps/local-printshop';
import Download from 'material-ui/svg-icons/editor/publish';
import NewFile from 'material-ui/svg-icons/editor/insert-drive-file';
import Image from 'material-ui/svg-icons/image/image';

const menuBarFontStyle = {
    fontSize: 13,
    color: '#757575'
};

const EditorButton = (props) =>
    <FlatButton {...props} style={{height: '32px', lineHeight: '32px', minWidth: '45px'}}
                label={props.label} labelStyle={Object.assign({textTransform: 'capitalize'}, menuBarFontStyle)}/>;

class EditorMenubarControls extends Component {
    file = {
        open: () => this.props.dispatch(openDashboard(this.context.router.history)),
        create: () => this.props.dispatch(createFile(this.props.googleAPI.get('api').drive, NEW_DOC_NAME)),
        print: () => this.props.dispatch(printPDF()),
        download: {
            tex: () => this.props.dispatch(downloadTex()),
            pdf: () => this.props.dispatch(downloadPDF())
        }
    };

    edit = {
        undo: () => this.props.dispatch(undo()),
        redo: () => this.props.dispatch(redo())
    };

    insert = {
        image: () => {
            const accessToken = this.props.googleAPI.get('accessToken');
            const pickerAPI = this.props.googleAPI.get('api').picker;
            const driveAPI = this.props.googleAPI.get('api').drive;
            this.props.dispatch(insertImage(driveAPI, accessToken, pickerAPI));
        }
    };

    buildMenu = (content) => {
        let ID = 0;
        const buildMenuItem = (entry) => {
            if (entry === 'div') return <Divider key={ID++}/>;
            return (
                <MenuItem
                    key={entry.title}
                    primaryText={entry.title}
                    secondaryText={entry.shortcut}
                    onTouchTap={entry.click ? this.handleRequestClose.bind(null, entry.click) : null}
                    leftIcon={entry.icon}
                    insetChildren={entry.hasOwnProperty('inset') ? entry.inset : !entry.icon}
                    rightIcon={entry.menu ? <ArrowDropRight/> : undefined}
                    menuItems={entry.menu ? entry.menu.map(buildMenuItem) : undefined}
                />
            )
        };

        return (
            <Menu desktop={true} width={256} >
                {content.map(buildMenuItem)}
            </Menu>
        );
    };

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };

        this.menus = {
            file: this.buildMenu([
                { title: "New", click: this.file.create, icon: <NewFile/>  },
                { title: "Open", click: this.file.open, shortcut: "Ctrl+O" },
                "div",
                { title: "Download", click: this.file.download.pdf, shortcut: "Ctrl+Alt+D", icon: <Download style={{transform: 'rotate(180deg)'}}/>},
                { title: "Download as", menu: [
                    { title: "Latex text (.tex)", click: this.file.download.tex, inset: false },
                    { title: "PDF Document (.pdf)", click: this.file.download.pdf, inset: false }
                ]},
                "div",
                { title: "Print", click: this.file.print, shortcut: "Ctrl+P", icon: <Printer/> }
            ]),

            edit: this.buildMenu([
                { title: "Undo", click: this.edit.undo },
                { title: "Redo", click: this.edit.redo },
                "div",
                { title: "Cut" },
                { title: "Copy" },
                { title: "Paste" },
                "div",
                { title: "Select all" },
            ]),

            insert: this.buildMenu([
                { title: "Image", click: this.insert.image, icon: <Image/> }
            ])
        };
    }

    handleTouchTap = (target, e) => {
        // This prevents ghost click.
        e.preventDefault();

        this.setState({
            target: target,
            open: true,
            anchorEl: e.currentTarget,
        });
    };

    handleHover = (target, e) => this.state.open ? this.handleTouchTap(target, e) : null;

    handleRequestClose = (fn) => {
        this.setState({ open: false });
        if (typeof fn === 'function') fn();
    };

    buildButtonProps = (name) => {
        return {
            label: name,
            onTouchTap: this.handleTouchTap.bind(null, name.toLowerCase()),
            onMouseEnter: this.handleHover.bind(null, name.toLowerCase())
        };
    };

    render() {
        const lastEdit = "TODO Last edit date"; // TODO Last edit

        return (
            <div className="menubar-buttons">
                <EditorButton {...this.buildButtonProps('File')}/>
                <EditorButton {...this.buildButtonProps('Edit')}/>
                <EditorButton {...this.buildButtonProps('View')}/>
                <EditorButton {...this.buildButtonProps('Insert')}/>
                <EditorButton {...this.buildButtonProps('Format')}/>
                <EditorButton {...this.buildButtonProps('Tools')}/>
                <EditorButton {...this.buildButtonProps('Table')}/>
                <EditorButton {...this.buildButtonProps('Add-ons')}/>
                <EditorButton {...this.buildButtonProps('Help')}/>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose}
                    animation={PopoverAnimationVertical}
                    useLayerForClickAway={false}
                >
                    {this.menus[this.state.target]}
                </Popover>
                <span className="last-edit" style={menuBarFontStyle}>{lastEdit}</span>
            </div>
        );
    }
}

EditorMenubarControls.contextTypes = {
    router: React.PropTypes.object
};

EditorMenubarControls.propTypes = {
    googleAPI: PropTypes.instanceOf(Map).isRequired
};

export default connect(
    (state) => {
        return {
            googleAPI: state.googleAPI
        }
    }
)(EditorMenubarControls);
