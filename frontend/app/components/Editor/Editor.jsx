import React from "react";
import {Editor, EditorState, ContentState, getDefaultKeyBinding, RichUtils} from "draft-js";
import CodeUtils from 'draft-js-code';

import "prismjs";
import "prismjs/components/prism-latex.min.js";

// // Line numbers plugin
// import "prismjs/plugins/line-numbers/prism-line-numbers.min.js";
// import "!style!css!prismjs/plugins/line-numbers/prism-line-numbers.css";

import "!style!css!prismjs/themes/prism-solarizedlight.css";
import "./Editor.css";

import PrismDecorator from "draft-js-prism";

export default class LatexEditor extends React.Component {
    constructor(props) {
        super(props);

        const decorator = new PrismDecorator({defaultSyntax: 'latex', filter: () => true});
        const contentState = ContentState.createFromText(require("raw-loader!../latex"));

        this.state = {editorState: EditorState.createWithContent(contentState, decorator)};

        this.onChange = (editorState) => {
            const contentState = editorState.getCurrentContent();
            const selectionBefore = contentState.getSelectionBefore();
            const selectionAfter = contentState.getSelectionAfter();
            // console.log(contentState.getPlainText());
            console.log(selectionBefore.getStartKey(), selectionBefore.getStartOffset(), selectionAfter);

            this.setState({editorState});
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

    render() {
        return (
            <Editor
                placeholder="Go ahead, type some latex!"
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
