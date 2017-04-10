import React, {Component} from 'react';
import {DOC_CONTENT_ID, RENDER_DELAY, WS_URL} from "../../../const";
import PDFView from "./PDFView/PDFView";
import Loader from "../../Loader/Loader";

export default class TexRenderer extends Component {
    constructor(args) {
        super(args);

        this.state = {
            wsOpen: false,
            blob: undefined
        };

        const renderer = this;

        this.ws = new WebSocket(WS_URL);
        this.ws.onopen = () => {
            renderer.setState({
                wsOpen: true
            });
        };
        this.ws.onmessage = (e) => {
            const pdfBlob = new Blob([e.data], { type: "application/pdf" });
            renderer.setState({
                blob: pdfBlob
            });
        };

        this.requestBlob = this.requestBlob.bind(this);
        this.requestBlobFromDocument = this.requestBlobFromDocument.bind(this);
        this.getContent = this.getContent.bind(this);
    }

    requestBlob(data) {
        if (data !== '')
            this.ws.send(data);
    }

    requestBlobFromDocument() {
        const renderer = this;
        if (this.renderTimeout) clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            const content = renderer.props.document ? renderer.getContent() : '';
            renderer.requestBlob(content);
        }, RENDER_DELAY);
    }

    getContent() {
        return this.props.document.getModel().getRoot().get(DOC_CONTENT_ID);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.document !== this.props.document) {
            this.getContent().addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.requestBlobFromDocument);
            this.getContent().addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.requestBlobFromDocument);
            this.requestBlobFromDocument();
        }

        if (!prevState.wsOpen && this.state.wsOpen)
            this.requestBlobFromDocument();
    }

    render() {
        const pdfView = <PDFView pdf={this.state.blob} />;
        const connecting = <Loader text="Connecting to server"/>;
        const receiving = <Loader text="Receiving document"/>;
        const waitingForDoc = <Loader text="Waiting for document"/>;

        if (!this.state.wsOpen) {
            return connecting;
        } else if (!this.props.document) {
            return waitingForDoc;
        } else if (!this.state.blob) {
            return receiving;
        } else if (this.state.wsOpen && this.state.blob) {
            return pdfView;
        }
    }
}
