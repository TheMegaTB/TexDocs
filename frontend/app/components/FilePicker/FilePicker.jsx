import React, {Component, PropTypes} from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import MoreIcon from 'material-ui/svg-icons/navigation/more-vert';
import pdfjsLib from "pdfjs-dist";
import {Map, List} from 'immutable';

import './FilePicker.css';
import {Link} from "react-router-dom";
import Measure from "react-measure";
import {dateToString} from "../../api/time";
import {
    DropDownMenu, FontIcon, IconMenu, MenuItem, RaisedButton, Subheader, Toolbar, ToolbarGroup, ToolbarSeparator,
    ToolbarTitle
} from "material-ui";
import SortIcon from 'material-ui/svg-icons/av/sort-by-alpha';
import {Sticky, StickyContainer} from "react-sticky";
import {generateThumbnail, updateFileList} from "../../redux/actions/home";
import {connect} from "react-redux";


pdfjsLib.PDFJS.workerSrc = '/pdf.worker.js';

const DSR_FACTOR = 2; // Multiplier for the rendered PDF previews resolution
const PICKER_MAX_COLUMNS = 5;
const PICKER_PADDING = 20;
const PICKER_DOC_BORDER = 1;
const PICKER_DOC_WIDTH = 207;
const PICKER_DOC_HEIGHT = PICKER_DOC_WIDTH / 21 * 29;
const PICKER_DOC_MARGIN = 10;
const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        // height: 'calc(100% - 74px)', // 64px (document metadata height) + PICKER_DOC_MARGIN
        // overflowY: 'auto',
    },
    container: {
        padding: `0 ${PICKER_DOC_MARGIN * 2}`,
        backgroundColor: '#eee',
        maxWidth: (PICKER_DOC_WIDTH + PICKER_DOC_BORDER * 2 + PICKER_DOC_MARGIN * 2) * PICKER_MAX_COLUMNS + PICKER_PADDING,
        margin: 'auto'
    }
};

class FilePicker extends Component {
    constructor(args) {
        super(args);

        this.state = {
            cols: 1
        }
    }

    componentWillMount() {
        this.props.dispatch(updateFileList(this.props.driveAPI));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.texFiles !== this.props.texFiles) {
            this.props.texFiles.forEach((file) => {
                if (!this.props.thumbnails.has(file.id)) {
                    this.props.dispatch(generateThumbnail(this.props.driveAPI, file.id, PICKER_DOC_WIDTH, DSR_FACTOR));
                }
            })
        }
    }

    render() {
        const gridDimensions = {
            width: this.state.cols * (PICKER_DOC_WIDTH + PICKER_DOC_MARGIN * 2),
            height: Math.ceil(this.props.texFiles.size / this.state.cols) * (PICKER_DOC_HEIGHT + PICKER_DOC_MARGIN * 2) + PICKER_PADDING
        };

        return (
            <StickyContainer>
                <Sticky style={{width: '100%'}} className="picker-toolbar">
                    <Toolbar style={{backgroundColor: '#eee', width: gridDimensions.width, margin: 'auto', paddingRight: 0}}>
                        <ToolbarGroup firstChild={true}>
                            <Subheader>Recent documents</Subheader>
                        </ToolbarGroup>
                        <ToolbarGroup>
                            {/*<ToolbarTitle text="Options" />*/}
                            {/*<FontIcon className="muidocs-icon-custom-sort" />*/}
                            {/*<ToolbarSeparator />*/}
                            {/*<RaisedButton label="Create Broadcast" primary={true} />*/}
                            {/*<IconMenu*/}
                                {/*iconButtonElement={*/}
                                    {/*<IconButton>*/}
                                        {/*<SortIcon />*/}
                                    {/*</IconButton>*/}
                                {/*}*/}
                                {/*targetOrigin={{horizontal: 'center', vertical: 'top'}}*/}
                            {/*>*/}
                                {/*<MenuItem primaryText="Last opened by me" />*/}
                                {/*<MenuItem primaryText="Last modified by me" />*/}
                                {/*<MenuItem primaryText="Last modified" />*/}
                                {/*<MenuItem primaryText="Title" />*/}
                            {/*</IconMenu>*/}
                        </ToolbarGroup>
                    </Toolbar>
                </Sticky>
                <div style={styles.container}>
                    <Measure onMeasure={(dimensions) => {this.setState({ height: dimensions.height, cols: Math.floor(dimensions.width / PICKER_DOC_WIDTH) })}}>
                        <div style={styles.root}>
                            <GridList
                                cellHeight='auto'
                                cols={this.state.cols}
                                style={{
                                    width: gridDimensions.width,
                                    height: gridDimensions.height
                                }}
                            >
                                {this.props.texFiles.map((file) => {
                                    return (
                                        <GridTile
                                            key={file.id}
                                            containerElement={<Link to={`/d/${file.id}`} />}
                                            title={file.name}
                                            style={{width: PICKER_DOC_WIDTH, height: PICKER_DOC_HEIGHT, color: 'black'}}
                                            titleBackground="white"
                                            titleStyle={{color: 'black'}}
                                            subtitle={`Opened ${dateToString(new Date(file.viewedByMeTime))}`}
                                            className="picker-document"
                                            actionIcon={
                                                <IconButton><MoreIcon color="#9E9E9E" hoverColor="#424242"/></IconButton>
                                            }
                                        >
                                            <img src={this.props.thumbnails.get(file.id)}/>
                                        </GridTile>
                                    )
                                })}
                            </GridList>
                        </div>
                    </Measure>
                </div>
            </StickyContainer>
        )
    }
}

FilePicker.propTypes = {
    driveAPI: PropTypes.object.isRequired,
    texFiles: PropTypes.instanceOf(List).isRequired,
    thumbnails: PropTypes.instanceOf(Map).isRequired
};

export default connect(
    (state) => {
        return {
            driveAPI: state.googleAPI.get('api').drive,
            texFiles: state.home.get('texFiles'),
            thumbnails: state.home.get('thumbnails')
        }
    }
)(FilePicker);
