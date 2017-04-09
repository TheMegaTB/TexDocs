import React, {Component} from "react";
import pdfjsLib from "pdfjs-dist";
import {Scrollbars} from "react-custom-scrollbars";
import Measure from "react-measure";
import {Paper} from "material-ui";

import "./PDFView.css";
import Loader from "../../Loader/Loader";
import {RENDER_DELAY} from "../../../const";

if (process.env.NODE_ENV !== 'production') {
    pdfjsLib.PDFJS.workerSrc = `/pdf.worker.js`;
} else {
    pdfjsLib.PDFJS.workerSrc = `${process.env.APP_ROOT}/build/pdf.worker.js`;
}

class Page extends Component {
    constructor(args) {
        super(args);

        this.renderPage = this.renderPage.bind(this);
        this.updatePage = this.updatePage.bind(this);
    }

    renderPage() {
        const container = this;

        this.props.pdf.getPage(this.props.page).then((page) => {
            const viewport = page.getViewport(this.props.width / page.getViewport(1.0).width);

            // Prepare canvas using PDF page dimensions
            const canvas = container.canvas;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);
            renderTask.then(function () {
                console.log('Page rendered');
            });
        });
    }

    updatePage() {
        if (this.renderTimeout) clearTimeout(this.renderTimeout);

        this.renderTimeout = setTimeout(this.renderPage, RENDER_DELAY);
    }

    componentDidUpdate() {
        this.updatePage();
    }

    componentDidMount() {
        this.renderPage();
    }

    render() {
        return (
            <Paper className="pdf-paper" zDepth={2} style={{width: this.props.width}}>
                <canvas ref={(canvas) => {
                    this.canvas = canvas;
                }}/>
            </Paper>
        );
    }
}

export default class PDFView extends Component {
    constructor(args) {
        super(args);

        this.state = {
            ready: false,
            width: 0,
            height: 0
        };

        this.updateDocument = this.updateDocument.bind(this);
        this.updateWidth = this.updateWidth.bind(this);
        this.scrollToPage = this.scrollToPage.bind(this);
    }

    updateDocument() {
        const viewer = this;
        pdfjsLib.PDFJS.getDocument(this.props.pdf).then((pdf) => {
            viewer.pdf = pdf;
            viewer.setState({
                ready: true
            });
        });
    }

    componentWillMount() {
        this.updateDocument();
    }

    updateWidth(e) {
        this.setState({width: e.width - 40, height: e.height});
    }

    scrollToPage(page) {
        const scrollbars = this.scroll;
        const distanceFromTop = page * (this.state.height / this.pdf.numPages + 20) + scrollbars.getClientHeight(); // 20 = margin between pages
        scrollbars.scrollTop(distanceFromTop - 10);
    }

    render() {
        const pdfLoaded = this.state.ready && this.pdf;
        const pages = pdfLoaded ? [...new Array(this.pdf.numPages).keys()] : [1];
        if (pages.length > 1) pages.shift(); // Remove page 0 since counting starts @ 1
        return (
            <Scrollbars style={{height: '100%'}} autoHide autoHideTimeout={1000} autoHideDuration={200}
                        ref={(scroll) => {
                            this.scroll = scroll;
                        }}>
                <Measure onMeasure={this.updateWidth}>
                    <div className="paper-wrapper">
                        { pdfLoaded ? pages.map((page) => <Page key={page} pdf={this.pdf} page={page}
                                                                width={this.state.width}/>) :
                            <Loader text="Loading PDF"/>}
                    </div>
                </Measure>
            </Scrollbars>
        )
    }
}

// import SaikuPDF from 'saiku-react-pdfjs';
// import {Paper} from "material-ui";
//
// import './PDFView.css';
//
// export default class PDFView extends Component {
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             initial: true,
//             currentPage: 0,
//             numberOfPages: 0,
//             width: 0
//         };
//
//         this.onDocumentComplete = this.onDocumentComplete.bind(this);
//         this.onPageComplete = this.onPageComplete.bind(this);
//     }
//
//     onDocumentComplete(numberOfPages, pdf) {
//         this.setState({ numberOfPages });
//     }
//
//     onPageComplete(currentPage, page) {
//         if (this.state.initial) {
//             this.setState({
//                 initial: false,
//                 width: page.getViewport(this.props.scale).width
//             });
//         }
//     }
//
//     render() {
//         const pages = this.state.numberOfPages ? [...new Array(this.state.numberOfPages).keys()] : [1];
//         const loadCallback = this.state.numberOfPages ? undefined : this.onDocumentComplete;
//         if (pages.length > 1) pages.shift();
//         return (
//             <div className="paper-wrapper">
//                 {pages.map((page) => {
//                     return <Paper key={'pdf-paper-' + page} className="pdf-paper" zDepth={2} style={{width: this.state.width}}><SaikuPDF
//                         key={'pdf-' + page}
//                         file="/static/output/Math.pdf"
//                         page={page}
//                         scale={this.props.scale}
//                         onDocumentComplete={loadCallback}
//                         onPageComplete={this.onPageComplete}
//                     /></Paper>;
//                 })}
//             </div>
//         );
//     }
// }
