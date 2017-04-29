import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/snippets/snippets';
const ace = require('brace');
const snippetManager = ace.acequire('ace/snippets').snippetManager;

import {BOLD, INSERT_IMAGE, REDO, UNDO} from "./reducers/editor/texEditor";

export const logger = store => next => action => {
    console.log('dispatching', action);
    const result = next(action);
    // console.log('next state', store.getState());
    return result
};

export const editor = store => next => action => {
    const editor = store.getState().editor.texEditor.get('editor');
    switch (action.type) {
        case BOLD:
            snippetManager.insertSnippet(editor, "\\textbf{${0:${SELECTED_TEXT:/* code */}}}");
            break;
        case INSERT_IMAGE:
            snippetManager.insertSnippet(editor, `\\includegraphics[width=\\textwidth, keepaspectratio]{\${0:${action.service}:${action.id}}}`);
            break;
        case UNDO:
            editor.undo();
            break;
        case REDO:
            editor.redo();
            break;
        default:
            break;
    }
    return next(action);
};
