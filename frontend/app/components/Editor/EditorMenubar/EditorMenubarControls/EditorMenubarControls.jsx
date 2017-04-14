import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import {createDocument, openDocument} from '../../../../api/google';

import {Divider, FlatButton} from "material-ui";
import Popover, {PopoverAnimationVertical} from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import {DOC_CONTENT_ID, NEW_DOC_NAME} from "../../../../const";
import {downloadPdf, downloadTex, printPdf} from "../../../../api/pdf";
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Printer from 'material-ui/svg-icons/maps/local-printshop';
import Download from 'material-ui/svg-icons/editor/publish';
import NewFile from 'material-ui/svg-icons/editor/insert-drive-file';

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

    onFilePrint = () => {
        this.handleRequestClose();
        printPdf(this.props.docState);
    };

    onFileDownload = () => {
        this.handleRequestClose();
        downloadPdf(this.props.docState);
    };

    onTexFileDownload = () => {
        this.handleRequestClose();
        if (this.context.document)
            downloadTex(this.context.document.getModel().getRoot().get(DOC_CONTENT_ID).toString(), this.props.docState);
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
                        <MenuItem primaryText="New"
                                  onTouchTap={this.onFileCreate}
                                  leftIcon={<NewFile/>}
                        />
                        <MenuItem primaryText="Open" secondaryText="&#8984;O" onTouchTap={this.onFileOpen} insetChildren={true}/>
                        <Divider />
                        <MenuItem primaryText="Download"
                                  secondaryText="&#8997;&#8984;D"
                                  onTouchTap={this.onFileDownload}
                                  leftIcon={<Download style={{transform: 'rotate(180deg)'}}/>}
                        />
                        <MenuItem primaryText="Download as"
                                  insetChildren={true}
                                  rightIcon={<ArrowDropRight/>}
                                  menuItems={[
                                      <MenuItem primaryText="Latex text (.tex)" onTouchTap={this.onTexFileDownload}/>,
                                      <MenuItem primaryText="PDF Document (.pdf)" onTouchTap={this.onFileDownload}/>
                                  ]}
                        />
                        <Divider />
                        <MenuItem primaryText="Print"
                                  secondaryText="&#8984;P"
                                  leftIcon={<Printer/>}
                                  onTouchTap={this.onFilePrint}
                        />
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
    router: React.PropTypes.object,
    document: React.PropTypes.any
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
