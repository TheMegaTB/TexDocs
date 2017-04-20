import React, {Component} from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import MoreIcon from 'material-ui/svg-icons/navigation/more-vert';
import {getDocument, listDocuments} from "../../api/google";
import pdfjsLib from "pdfjs-dist";

import './FilePicker.css';
import {Link} from "react-router-dom";
import Measure from "react-measure";
import {dateToString} from "../../api/time";

pdfjsLib.PDFJS.workerSrc = '/pdf.worker.js';

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
        height: 'calc(100% - 74px)', // 64px (document metadata height) + PICKER_DOC_MARGIN
        overflowY: 'auto',
        padding: PICKER_DOC_MARGIN * 2,
    },
    container: {
        backgroundColor: '#eee',
        maxWidth: (PICKER_DOC_WIDTH + PICKER_DOC_BORDER * 2 + PICKER_DOC_MARGIN * 2) * PICKER_MAX_COLUMNS + PICKER_PADDING,
        margin: 'auto'
    }
};

function compareViewedByMeTime(a,b) {
    if (a.viewedByMeTime < b.viewedByMeTime)
        return 1;
    if (a.viewedByMeTime > b.viewedByMeTime)
        return -1;
    return 0;
}

export default class FilePicker extends Component {
    constructor(args) {
        super(args);

        this.state = {
            files: [],
            thumbnails: {},
            cols: 1
        }
    }

    generatePreview = (file) => {
        getDocument(file.id, (rawPDF) => {
            pdfjsLib.PDFJS.getDocument({ data: rawPDF }).then((pdf) => {
                pdf.getPage(1).then((page) => {
                    const scale = 1.5;
                    const viewport = page.getViewport(scale);

                    // Prepare canvas using PDF page dimensions
                    const canvas = document.createElement("canvas"); //document.getElementById('the-canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    const renderTask = page.render(renderContext);
                    renderTask.then(() => {
                        const thumbnails = this.state.thumbnails;
                        thumbnails[file.id] = canvas.toDataURL();
                        this.setState({ thumbnails: thumbnails });
                    });
                });
            }, (err) => {
                // Silently ignore errors
                // TODO Store other thumbnail
                // console.log(err);
                // throw err;
            });
        });
    };

    componentWillMount() {
        listDocuments({}, (res) => {
            res.files.sort(compareViewedByMeTime);
            res.files.forEach((file) => this.generatePreview(file));
            this.setState({ files: this.state.files.concat(res.files) });
        });
    }

    render() {
        const gridDimensions = {
            width: this.state.cols * (PICKER_DOC_WIDTH + PICKER_DOC_MARGIN * 2),
            height: Math.ceil(this.state.files.length / this.state.cols) * (PICKER_DOC_HEIGHT + PICKER_DOC_MARGIN * 2)
        };

        // if (gridDimensions.height > this.state.height) gridDimensions.height = this.state.height - this.state.cols * PICKER_DOC_MARGIN * 2;

        return (
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
                            {this.state.files.map((file) => (
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
                                    <img src={this.state.thumbnails[file.id]}/>
                                </GridTile>
                                )
                            )}
                        </GridList>
                    </div>
                </Measure>
            </div>
        )
    }
}
