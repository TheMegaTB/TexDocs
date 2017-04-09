import React, { Component } from 'react';
import SaikuPDF from 'saiku-react-pdfjs';
import {Paper} from "material-ui";

import './PDFView.css';

export default class PDFView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initial: true,
            currentPage: 0,
            numberOfPages: 0,
            width: 0
        };

        this.onDocumentComplete = this.onDocumentComplete.bind(this);
        this.onPageComplete = this.onPageComplete.bind(this);
    }

    onDocumentComplete(numberOfPages, pdf) {
        this.setState({ numberOfPages });
    }

    onPageComplete(currentPage, page) {
        if (this.state.initial) {
            this.setState({
                initial: false,
                width: page.getViewport(this.props.scale).width
            });
        }
    }

    render() {
        const pages = this.state.numberOfPages ? [...new Array(this.state.numberOfPages).keys()] : [1];
        const loadCallback = this.state.numberOfPages ? undefined : this.onDocumentComplete;
        if (pages.length > 1) pages.shift();
        return (
            <div className="paper-wrapper">
                {pages.map((page) => {
                    return <Paper key={'pdf-paper-' + page} className="pdf-paper" zDepth={2} style={{width: this.state.width}}><SaikuPDF
                        key={'pdf-' + page}
                        file="/static/output/Math.pdf"
                        page={page}
                        scale={this.props.scale}
                        onDocumentComplete={loadCallback}
                        onPageComplete={this.onPageComplete}
                    /></Paper>;
                })}
            </div>
        );
    }
}
