import React from "react";
import {ContentBlock, ContentState, Editor, EditorState, getDefaultKeyBinding, RichUtils} from "draft-js";
import CodeUtils from "draft-js-code";

import "prismjs";
import "prismjs/components/prism-latex.min.js";

import "!style!css!prismjs/themes/prism-solarizedlight.css";
import "./EditorContent.css";

import {DOC_CONTENT_ID} from "../../../const";
import {Cursor} from "../../../api/Cursor";
import PrismDecorator from "../../../api/prism/PrismDecorator";

export default class EditorContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            loaded: false
        };

        this.onExternalCursorChange = this.onExternalCursorChange.bind(this);
        this.onExternalChange = this.onExternalChange.bind(this);
        this.onChange = (editorState) => {
            const editor = this;

            if (editor.state.loaded) {
                editor.updateCursorPosition(editorState);
                editor.setState({editorState});

                editor.collaborativeString.setText(
                    editorState.getCurrentContent().getPlainText()
                );
            }
        }
    }

    updateCursorPosition(editorState) {
        const content = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const getIndex = (key, offset) => {
            let index = 0;
            const blocks = content.getBlocksAsArray();
            for (let block in blocks) {
                if (!blocks.hasOwnProperty(block)) continue;
                block = blocks[block];

                if (block.getKey() === key) {
                    return index + offset;
                }

                index += block.getText().length;
            }
        };

        const start = getIndex(selection.getStartKey(), selection.getStartOffset());
        const end = getIndex(selection.getEndKey(), selection.getEndOffset());
        this.cursor.setCaret(start, end, selection.getIsBackward());
    }

    handleKeyCommand(command) {
        const editorState = this.state.editorState;
        let newState;

        newState = CodeUtils.handleKeyCommand(editorState, command);

        if (!newState) {
            newState = RichUtils.handleKeyCommand(editorState, command);
        }

        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    keyBindingFn(e) {
        let command = CodeUtils.getKeyBinding(e);

        return command ? command : getDefaultKeyBinding(e);
    }

    handleReturn(e) {
        this.onChange(
            CodeUtils.handleReturn(e, this.state.editorState)
        );
        return true;
    }

    handleTab(e) {
        this.onChange(
            CodeUtils.handleTab(e, this.state.editorState)
        );
        return true;
    }

    onExternalCursorChange(data) {
        console.log("CURSOR UPDATE", data);
        this.setState({
            editorState: EditorState.set(this.state.editorState, {decorator: this.getDecorator()})
        });
    }

    getDecorator() {
        const rawCursors = this.cursor.getCursors();
        const cursors = {};
        const rawText = this.state.editorState.getCurrentContent().getPlainText();
        const blocks = this.state.editorState.getCurrentContent().getBlocksAsArray();

        // TODO Beginning and end of the line doesn't work yet
        Object.keys(rawCursors).forEach((offset) => {
            const textBefore = rawText.substr(0, offset);

            const blockIndex = textBefore.split(/\r\n|\r|\n/).length - 1;
            const blockKey = blocks[blockIndex].getKey();

            const lastNewline = textBefore.lastIndexOf('\n');
            const localOffset = lastNewline > -1 ? offset - lastNewline : offset;

            if (!cursors[blockKey]) cursors[blockKey] = {};
            cursors[blockKey][localOffset] = rawCursors[offset];
        });

        return new PrismDecorator({defaultSyntax: 'latex', filter: () => true}, cursors);
    }

    onDocumentLoad(collaborativeString) {
        this.collaborativeString = collaborativeString;

        const contentState = ContentState.createFromText(this.collaborativeString.toString());

        // const cursors = {};
        // cursors[contentState.getBlocksAsArray()[0].getKey()] = {
        //     5: {
        //         name: 'Til Blechschmidt',
        //         color: 'orange'
        //     },
        //     10: {
        //         name: 'Noah Peeters',
        //         color: 'rgb(31, 161, 93)'
        //     }
        // };

        this.setState({
            editorState: EditorState.createWithContent(contentState, this.getDecorator()),
            loaded: true
        });
    }

    onExternalChange(data) {
        if (data.isLocal) return;

        const newText = data.currentTarget.toString();
        const blockIndex = newText.substr(0, data.index).split(/\r\n|\r|\n/).length;

        const newContentState = ContentState.createFromText(newText);
        const oldContentState = this.state.editorState.getCurrentContent();

        let newContentBlocks = newContentState.getBlocksAsArray();
        let oldContentBlocks = oldContentState.getBlocksAsArray();

        // Modify old blocks array (add/delete a line) if the amount mismatches
        if (newContentBlocks.length !== oldContentBlocks.length) {
            if (data.type === gapi.drive.realtime.EventType.TEXT_INSERTED) {
                // Insert new placeholder block (w/ key)
                oldContentBlocks.splice(blockIndex, 0, new ContentBlock({key: newContentBlocks[blockIndex].getKey()}));
            } else if (data.type === gapi.drive.realtime.EventType.TEXT_DELETED) {
                // Remove deprecated block
                oldContentBlocks.splice(blockIndex, 1);
            }
        }

        // Copy over the keys from the old blocks to the new ones
        const mergedContentBlocks = newContentBlocks.map((block, index) => {
            return block.set('key', oldContentBlocks[index].getKey());
        });

        this.setState({
            editorState: EditorState.push(this.state.editorState, ContentState.createFromBlockArray(mergedContentBlocks), 'change-block-data')
        });
    }

    componentWillMount() {
        const document = this.props.document;
        const collabString = document.getModel().getRoot().get(DOC_CONTENT_ID);

        this.cursor = new Cursor(this.props.document, this.props.sID, this.onExternalCursorChange);
        this.onDocumentLoad(collabString);

        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_INSERTED, this.onExternalChange);
        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_DELETED, this.onExternalChange);
    }

    render() {
        return (
            <Editor
                placeholder="Loading document ..."
                editorState={this.state.editorState}
                onChange={this.onChange}
                keyBindingFn={this.keyBindingFn.bind(this)}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                handleReturn={this.handleReturn.bind(this)}
                onTab={this.handleTab.bind(this)}
                readOnly={this.props.readOnly}
            />
        );
    }
}
