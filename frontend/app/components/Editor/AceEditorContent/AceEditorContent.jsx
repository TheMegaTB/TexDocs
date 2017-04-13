import React from 'react';

import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/latex';
import 'brace/theme/tomorrow';
import {DOC_CONTENT_ID} from "../../../const"; // So we could use it as the "theme" prop

import './AceEditorContent.css';
import {Cursor} from "../../../api/Cursor";

const ace = require('brace');
const Range = ace.acequire('ace/range').Range;

const AceProps = {
    height: '100%',
    width: '100%',
    mode: 'latex',
    theme: 'tomorrow',
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
    wrapEnabled: true,
    highlightActiveLine: true,
    fontSize: '15'
};

class SelectionStyle extends React.Component {
    render() {
        return (
            <style key={'caret-style-' + this.props.id} dangerouslySetInnerHTML={{__html: `
                .collab-caret.caret-color-${this.props.id} {
                    background-color: ${this.props.color};
                }
                .collab-caret.caret-color-${this.props.id}:after {
                    background-color: ${this.props.color};
                    content: '${this.props.name}';
                }
                .collab-selection.caret-color-${this.props.id} {
                    background-color: ${this.props.color};
                }
            `}} />
        );
    }
}

export default class AceEditorContent extends React.Component {
    constructor(args) {
        super(args);

        this.state = {
            collabString: undefined,
            content: "",
            cursors: {}
        };

        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.setCollaboratorSelection = this.setCollaboratorSelection.bind(this);
        this.onEditorLoad = this.onEditorLoad.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onExternalChange = this.onExternalChange.bind(this);
    }

    onSelectionChange(type, value) {
        if (this.state.cursor && !this.externalUpdate)
            this.state.cursor.setCaret(type, value);
    }

    setCollaboratorSelection(caret) {
        if (!caret) return;
        const cursor = this.state.cursors[caret.sessionID];
        if (cursor) {
            this.aceEditor.editor.getSession().removeMarker(cursor.caret);
            this.aceEditor.editor.getSession().removeMarker(cursor.selection);
        }

        if (caret.lead.row !== undefined) {
            let selectionID;
            let caretID;

            if (!(caret.lead.row === caret.anchor.row && caret.lead.column === caret.anchor.column)) {
                let backwards = false;
                if (caret.lead.row < caret.anchor.row) backwards = true;
                if (caret.lead.row === caret.anchor.row && caret.lead.column < caret.anchor.column) backwards = true;

                let selectionRange;
                if (backwards)
                    selectionRange = new Range(caret.lead.row, caret.lead.column, caret.anchor.row, caret.anchor.column);
                else
                    selectionRange = new Range(caret.anchor.row, caret.anchor.column, caret.lead.row, caret.lead.column);


                selectionID = this.aceEditor.editor.getSession().addMarker(selectionRange, `collab-selection caret-color-${caret.sessionID}`, "text", true);
            }

            const caretRange = new Range(caret.lead.row, caret.lead.column, caret.lead.row, caret.lead.column + 1);
            caretID = this.aceEditor.editor.getSession().addMarker(caretRange, `collab-caret caret-color-${caret.sessionID}`, "text", true);

            const cursors = this.state.cursors;
            cursors[caret.sessionID] = {
                caret: caretID,
                selection: selectionID,
                name: caret.name,
                color: caret.color
            };
            this.setState({
                cursors: cursors
            });
        }
    }

    onEditorLoad(editor) {
        editor.$blockScrolling = Infinity;

        const selection = editor.session.getSelection();
        const aceEditor = this;

        selection.selectionAnchor.addEventListener('change', (e) => {
            aceEditor.onSelectionChange('anchor', e.value);
        });
        selection.selectionLead.addEventListener('change', (e) => {
            aceEditor.onSelectionChange('lead', e.value);
        });
    }

    onChange(e) {
        this.setState({ content: e });
        this.state.collabString.setText(e);
    }

    onExternalChange(e) {
        if (!e.isLocal) {
            this.externalUpdate = true;
            const scrollPosition = this.aceEditor.editor.session.getScrollTop();
            this.setState({ content: e.target.text });
            this.aceEditor.editor.session.setScrollTop(scrollPosition);
            this.externalUpdate = false;
        }
    }

    componentDidMount() {
        const document = this.props.document;
        const collabString = document.getModel().getRoot().get(DOC_CONTENT_ID);

        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_INSERTED, this.onExternalChange);
        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_DELETED, this.onExternalChange);

        const cursor = new Cursor(this.props.document, this.props.sID, this.setCollaboratorSelection);

        this.setState({
            collabString: collabString,
            content: collabString.toString(),
            cursor: cursor
        });
    }

    render() {
        const styles = [];
        for (let sID in this.state.cursors) {
            if (!this.state.cursors.hasOwnProperty(sID)) continue;
            const cursor = this.state.cursors[sID];
            styles.push(<SelectionStyle key={sID} id={sID} name={cursor.name} color={cursor.color} />)
        }
        return (
            <div>
                <AceEditor
                    {...AceProps}
                    value={this.state.content}
                    onChange={this.onChange}
                    onLoad={this.onEditorLoad}
                    markers={[{row: 10, column: 2}]}
                    ref={(aceEditor) => this.aceEditor = aceEditor}
                />
                {styles}
            </div>
        );
    }
}
