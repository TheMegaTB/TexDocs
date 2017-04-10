import React, {Component} from "react";
import pdfjsLib from "pdfjs-dist";
import {Scrollbars} from "react-custom-scrollbars";
import Measure from "react-measure";

import "./PDFView.css";
import Loader from "../../../Loader/Loader";
import Page from "./Page";

if (process.env.NODE_ENV !== 'production') {
    pdfjsLib.PDFJS.workerSrc = `/pdf.worker.js`;
} else {
    pdfjsLib.PDFJS.workerSrc = `${process.env.APP_ROOT}/build/pdf.worker.js`;
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

    renderDocument(doc) {
        const viewer = this;
        pdfjsLib.PDFJS.getDocument(doc).then((pdf) => {
            viewer.pdf = pdf;
            viewer.setState({
                ready: true
            });
        }, (err) => {
            console.log(err);
            throw err;
        });
    }

    updateDocument() {
        const viewer = this;
        if (this.props.pdf instanceof Blob) {
            const fileReader = new FileReader();
            fileReader.onload = () => viewer.renderDocument({ data: fileReader.result });
            fileReader.readAsArrayBuffer(this.props.pdf);
        } else {
            viewer.renderDocument(this.props.pdf);
        }
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

    componentDidUpdate(prevProps, nextState) {
        if (prevProps.pdf !== this.props.pdf)
            this.updateDocument();
    }

    render() {
        const pdfLoaded = this.state.ready && this.pdf;
        const pages = pdfLoaded ? [...new Array(this.pdf.numPages + 1).keys()] : [1];
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
