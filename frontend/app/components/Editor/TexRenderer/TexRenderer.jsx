import React, {Component} from 'react';
import {DOC_CONTENT_ID, RENDER_DELAY, WS} from "../../../const";
import PDFView from "./PDFView/PDFView";
import Loader from "../../Loader/Loader";
import {updateFile} from "../../../api/google";

class TexRenderer extends Component {
    constructor(args) {
        super(args);

        const renderer = this;

        WS.onopen = () => {
            renderer.setState({
                wsOpen: true
            });
        };
        WS.onmessage = (e) => {
            const pdfBlob = new Blob([e.data], { type: "application/pdf" });

            renderer.setState({
                blob: pdfBlob
            });

            const metadata = this.context.store.getState().get('metadata');
            if (metadata && !this.state.initial) {
                updateFile(metadata.toJS(), pdfBlob);
            } else if (this.state.initial) {
                this.setState({ initial: false });
            }

            this.context.store.dispatch({type: 'PDF_LOADED', url: window.URL.createObjectURL(pdfBlob)});
        };

        this.state = {
            wsOpen: WS.readyState === 1,
            blob: undefined,
            initial: true
        };

        this.requestBlob = this.requestBlob.bind(this);
        this.requestBlobFromDocument = this.requestBlobFromDocument.bind(this);
        this.getContent = this.getContent.bind(this);
    }

    requestBlob(data) {
        if (data !== '')
            WS.send(JSON.stringify({ type: 'texSource', fileID: this.props.docID, tex: data.toString() }));
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
        if (prevProps.document !== this.props.document && this.props.document) {
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
        const processing = <Loader text="Processing document"/>;
        const waitingForDoc = <Loader text="Waiting for document"/>;

        if (!this.state.wsOpen) {
            return connecting;
        } else if (!this.props.document) {
            return waitingForDoc;
        } else if (!this.state.blob) {
            return processing;
        } else if (this.state.wsOpen && this.state.blob) {
            return pdfView;
        }
    }
}

TexRenderer.contextTypes = {
    store: React.PropTypes.object
};

export default TexRenderer;
