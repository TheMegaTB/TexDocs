import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {createDocument, openDocument} from "../../api/google";
import {NEW_DOC_NAME} from "../../const";

import './NoDocumentPopup.css';

class NoDocumentPopup extends React.Component {
    constructor(args) {
        super(args);

        this.state = {
            open: true,
        };

        this.createDocument = this.createDocument.bind(this);
        this.pickerCallback = this.pickerCallback.bind(this);
    }

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    createDocument() {
        createDocument(NEW_DOC_NAME, this.props.history);
    }

    pickerCallback() {
        this.handleClose();
    }

    render() {
        const actions = [
            <FlatButton
                label="Open"
                primary={true}
                onTouchTap={openDocument.bind(null, this.context.router.history, this.pickerCallback)}
            />,
            <FlatButton
                label="New"
                primary={true}
                onTouchTap={this.createDocument}
            />,
        ];

        return (
            <div>
                <Dialog
                    title={this.props.title}
                    actions={actions}
                    modal={true}
                    open={this.state.open}
                >
                    {this.props.text}
                </Dialog>
            </div>
        );
    }
}

NoDocumentPopup.contextTypes = {
    router: React.PropTypes.object
};

export default NoDocumentPopup;
