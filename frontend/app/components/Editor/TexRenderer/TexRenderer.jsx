import React, {Component, PropTypes} from 'react';
import { Map } from 'immutable';
import {RENDER_DELAY, WS} from "../../../const";
import PDFView from "./PDFView/PDFView";
import Loader from "../../Loader/Loader";
import {connect} from "react-redux";
import {pdfChanged} from "../../../redux/actions/editor/files";
import {uploadPDF} from "../../../api/google";

class TexRenderer extends Component {
    constructor(args) {
        super(args);

        const renderer = this;

        WS.onopen = () => {
            renderer.setState({ wsOpen: true });
            if (this.props.accessToken) // Send the accessToken to the server again since it might've restarted
                WS.send(JSON.stringify({
                    type: 'auth',
                    token: this.props.accessToken
                }));
        };
        WS.onmessage = (e) => {
            const pdfBlob = new Blob([e.data], { type: "application/pdf" });

            const metadata = this.props.files.get('metadata');
            if (metadata && !this.state.initial) {
                uploadPDF(this.props.client, metadata.id, pdfBlob).then(null, console.error);
            } else if (this.state.initial) {
                this.setState({ initial: false });
            }

            this.props.dispatch(pdfChanged(pdfBlob));
        };

        this.state = {
            wsOpen: WS.readyState === 1,
            initial: true
        };

        this.requestBlobFromDocument = this.requestBlobFromDocument.bind(this);
    }

    requestBlobFromDocument() {
        const renderer = this;
        if (this.renderTimeout) clearTimeout(this.renderTimeout);

        this.renderTimeout = setTimeout(() => {
            const data = renderer.props.files.get('tex');
            if (data)
                WS.send(JSON.stringify({
                    type: 'texSource',
                    fileID: this.props.files.get('metadata').id,
                    tex: data.toString()
                }));
        }, RENDER_DELAY);
    }

    componentDidUpdate(prevProps, prevState) {
        const websocketGotOpened = !prevState.wsOpen && this.state.wsOpen;
        const contentChanged = prevProps.files.get('tex') !== this.props.files.get('tex');
        const metadataChanged = prevProps.files.get('metadata') !== this.props.files.get('metadata');
        const requirementsMet = this.state.wsOpen && this.props.files.get('metadata');

        if (requirementsMet && (contentChanged || websocketGotOpened || metadataChanged))
            this.requestBlobFromDocument();
    }

    render() {
        const tex = this.props.files.get('tex');
        const blob = this.props.files.get('pdf');

        const pdfView = <PDFView pdf={blob} />;
        const connecting = <Loader text="Connecting to server"/>;
        const processing = <Loader text="Processing document"/>;
        const waitingForDoc = <Loader text="Waiting for document"/>;

        if (!this.state.wsOpen) {
            return connecting;
        } else if (!tex) {
            return waitingForDoc;
        } else if (!blob) {
            return processing;
        } else if (this.state.wsOpen && blob) {
            return pdfView;
        }
    }
}

TexRenderer.propTypes = {
    files: PropTypes.instanceOf(Map).isRequired,
    accessToken: PropTypes.string,
    client: PropTypes.object
};

export default connect(
    (state) => { return {
        files: state.editor.files,
        accessToken: state.googleAPI.get('accessToken'),
        client: state.googleAPI.get('api').client
    }}
)(TexRenderer);
