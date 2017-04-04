import React from "react";
import {Editor, EditorState, convertFromHTML, ContentState, getDefaultKeyBinding, RichUtils} from "draft-js";
import CodeUtils from 'draft-js-code';

import "prismjs";
import "prismjs/components/prism-latex.min.js";

// // Line numbers plugin
// import "prismjs/plugins/line-numbers/prism-line-numbers.min.js";
// import "!style!css!prismjs/plugins/line-numbers/prism-line-numbers.css";

import "!style!css!prismjs/themes/prism-solarizedlight.css";
import "./Editor.css";

import PrismDecorator from "draft-js-prism";
import {loadDocument} from "../../api/google";
import {saveTimeout} from "../../const";

export default class LatexEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            loaded: false
        };

        this.onChange = (editorState) => {
            const editor = this;

            if (editor.state.loaded) {
                console.log("Saving");
                editor.setState({editorState});

                editor.collaborativeString.setText(
                    editor.state.editorState.getCurrentContent().getPlainText()
                );
            }
        }
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

    componentWillMount() {
        const documentID = this.props.match.params.id;
        const editor = this;
        loadDocument(documentID, (collaborativeString) => {
            if (collaborativeString) {
                editor.collaborativeString = collaborativeString;

                const decorator = new PrismDecorator({defaultSyntax: 'latex', filter: () => true});
                const contentState = ContentState.createFromText(collaborativeString.toString());

                editor.setState({
                    editorState: EditorState.createWithContent(contentState, decorator),
                    loaded: true
                });

                const onEvent = (data) => {
                    if (data.isLocal) return;

                    console.log("-----");
                    console.log(data.index);
                    console.log(editor.state.editorState.getSelection().serialize());

                    const newText = data.currentTarget;

                    const newContentState = ContentState.createFromText(newText.toString());
                    const oldContentState = editor.state.editorState.getCurrentContent();

                    const newContentBlocks = newContentState.getBlocksAsArray();
                    const oldContentBlocks = oldContentState.getBlocksAsArray();

                    let mergedContentBlocks;
                    if (newContentBlocks.length === oldContentBlocks.length) {
                        // Copy over the keys from the old blocks to the new ones
                        mergedContentBlocks = newContentBlocks.map((block, index) => {
                            return block.set('key', oldContentBlocks[index].getKey());
                        });
                    } else {
                        // TODO figure out where to insert/remove blocks
                    }

                    editor.setState({
                        editorState: EditorState.push(editor.state.editorState, ContentState.createFromBlockArray(mergedContentBlocks), 'insert-characters')
                    })
                };

                collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, onEvent);
                collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, onEvent);
            }
        });
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
            />
        );
    }
}
