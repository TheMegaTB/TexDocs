import React, {Component, PropTypes} from 'react';
import {Map} from "immutable";

import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/latex';
import 'brace/theme/tomorrow';
import 'brace/ext/language_tools';
import 'brace/snippets/snippets';
import {DOC_CONTENT_ID} from "../../../const";

import './AceEditorContent.css';
import {Cursor} from "../../../api/Cursor";
import {getCommand} from "./completion/command";
import {commandCompleter} from "./completion/commandCompleter";
import {registerKeybindings} from "../../../api/keybindings";
import {connect} from "react-redux";
import {createCursor, editorLoaded, initializeEditor, setCaret} from "../../../redux/actions/editor/texEditor";
import Loader from "../../Loader/Loader";
import {EDITOR_UNLOADED} from "../../../redux/reducers/editor/texEditor";
import {texChanged} from "../../../redux/actions/editor/files";

const ace = require('brace');
const Range = ace.acequire('ace/range').Range;
const langTools = ace.acequire('ace/ext/language_tools');

// Remove local variable names aka all words in the document
langTools.setCompleters([
    commandCompleter,
    langTools.snippetCompleter,
    langTools.keyWordCompleter
]); //, langTools.textCompleter

const AceProps = {
    height: '100%',
    width: '100%',
    mode: 'latex',
    theme: 'tomorrow',
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false,
    enableSnippets: false,
    wrapEnabled: true,
    highlightActiveLine: true
};

class SelectionStyle extends Component {
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

class AceEditorContent extends React.Component {
    constructor(args) {
        super(args);

        this.state = { cursors: {} };

        this.setCollaboratorSelection = this.setCollaboratorSelection.bind(this);
    }

    setCollaboratorSelection(caret) {
        if (!caret || !this.aceEditor) return;
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
            this.setState({ cursors: cursors });
        }
    }

    onLoad = (editor) => {
        const document = this.props.editor.files.get('document');
        const sessionID = this.props.editor.files.get('sessionID');

        this.context.store.dispatch(editorLoaded(editor, this.context.store));
        this.context.store.dispatch(createCursor(document, sessionID, this.setCollaboratorSelection));
    };

    componentDidMount() {
        // registerKeybindings(this.aceEditor.editor.container, this.context.router.history);
        //
        // this.aceEditor.editor.container.addEventListener('keydown', (e) => {
        //     if (e.ctrlKey && e.which === 189) {
        //         e.preventDefault();
        //         this.setState({ fontSize: this.state.fontSize - 1 });
        //     } else if (e.ctrlKey && e.which === 187) {
        //         e.preventDefault();
        //         this.setState({ fontSize: this.state.fontSize + 1 });
        //     }
        // });
    }

    componentWillUnmount() {
        this.context.store.dispatch({ type: EDITOR_UNLOADED });
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
                {this.props.editor.files.has('document') ? <AceEditor
                    {...AceProps}
                    value={this.props.editor.files.get('tex')}
                    onChange={(e) => this.context.store.dispatch(texChanged(e))}
                    fontSize={this.props.editor.texEditor.get('fontSize')}
                    ref={(aceEditor) => this.aceEditor = aceEditor}
                    onLoad={this.onLoad}
                    editorProps={{$blockScrolling: Infinity}}
                /> : <Loader text="Loading document"/>}
                {styles}
            </div>
        );
    }
}

AceEditorContent.contextTypes = {
    router: React.PropTypes.object,
    store: React.PropTypes.object
};

AceEditorContent.propTypes = {
    editor: React.PropTypes.object
};

function mapStateToProps(state) {
    return {
        editor: state.editor
    };
}

export default connect(
    mapStateToProps
)(AceEditorContent);
