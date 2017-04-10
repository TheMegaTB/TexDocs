import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {createDocument} from "../../api/google";
import {MIME_TYPE} from "../../const";

import './NoDocumentPopup.css';

export default class DialogExampleModal extends React.Component {
    constructor(args) {
        super(args);

        this.state = {
            open: true,
        };

        this.createDocument = this.createDocument.bind(this);
        this.openDocument = this.openDocument.bind(this);
        this.pickerCallback = this.pickerCallback.bind(this);
    }

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    createDocument() {
        createDocument("Untitled tex document", (doc) => {
            this.props.history.push('/d/' + doc.id);
        });
    }

    openDocument() {
        // Create and render a Picker object for picking user Photos.
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes(MIME_TYPE);

        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(window.access_token)
            .setCallback(this.pickerCallback)
            .setSelectableMimeTypes(MIME_TYPE)
            .build(); //setDeveloperKey(developerKey).
        picker.setVisible(true);
    }

    // A simple callback implementation.
    pickerCallback(data) {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            console.log(doc);
            this.handleClose();
            this.props.history.push('/d/' + doc.id);
        }
    }

    render() {
        const actions = [
            <FlatButton
                label="Open"
                primary={true}
                onTouchTap={this.openDocument}
            />,
            <FlatButton
                label="Create"
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
