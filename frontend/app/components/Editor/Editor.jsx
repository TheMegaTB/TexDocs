import React from "react";
import {Editor, EditorState, ContentState} from "draft-js";
import "prismjs";
import "prismjs/components/prism-latex.min.js";
import PrismDecorator from "draft-js-prism";
// var PrismDecorator = require('draft-js-prism');

export default class LatexEditor extends React.Component {
    constructor(props) {
        super(props);

        const decorator = new PrismDecorator({defaultSyntax: 'latex', filter: () => true});
        // this.state = {editorState: EditorState.createEmpty(decorator)};
        const contentState = ContentState.createFromText(require("raw-loader!../latex"));
        this.state = {editorState: EditorState.createWithContent(contentState, decorator)};
        this.onChange = (editorState) => this.setState({editorState});
    }

    render() {
        return (
            <Editor editorState={this.state.editorState} onChange={this.onChange}/>
        );
    }
}
