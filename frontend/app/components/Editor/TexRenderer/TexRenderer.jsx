import React, {Component, PropTypes} from 'react';
import { Map } from 'immutable';
import {RENDER_DELAY, WS} from "../../../const";
import PDFView from "./PDFView/PDFView";
import Loader from "../../Loader/Loader";
import {updateFile} from "../../../api/google";
import {connect} from "react-redux";
import {pdfChanged} from "../../../redux/actions/editor/files";

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

            const metadata = this.props.files.get('metadata');
            if (metadata && !this.state.initial) {
                updateFile(metadata, pdfBlob);
            } else if (this.state.initial) {
                this.setState({ initial: false });
            }

            this.context.store.dispatch(pdfChanged(pdfBlob));
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

TexRenderer.contextTypes = {
    store: React.PropTypes.object
};

TexRenderer.propTypes = {
    files: PropTypes.instanceOf(Map).isRequired
};

function mapStateToProps(state) {
    return {
        files: state.editor.files
    };
}

export default connect(
    mapStateToProps
)(TexRenderer);
