import { Map } from 'immutable';

const initialEditorState = Map({
    initialized: false,
    editor: undefined
});


export const EDITOR_LOADED = 'editor-loaded';
export const EDITOR_INIT = 'initialize-editor';

export function texEditor(state = initialEditorState, action) {
    switch (action.type) {
        case EDITOR_LOADED:
            return state.set('editor', action.editor);
        case EDITOR_INIT:

            return state;
        default:
            return state;
    }
}
