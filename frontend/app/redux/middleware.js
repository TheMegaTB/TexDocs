import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/snippets/snippets';
const ace = require('brace');
const snippetManager = ace.acequire('ace/snippets').snippetManager;

import {BOLD} from "./reducers/editor/texEditor";

export const logger = store => next => action => {
    console.log('dispatching', action);
    let result = next(action);
    // console.log('next state', store.getState());
    return result
};

export const editor = store => next => action => {
    switch (action.type) {
        case BOLD:
            snippetManager.insertSnippet(store.getState().editor.texEditor.get('editor'), "\\textbf{${0:${SELECTED_TEXT:/* code */}}}");
            break;
        default:
            break;
    }
    return next(action);
};
