import { Map } from 'immutable';

const initialEditorState = Map({
    // editor: ...,
    // cursor: ...,
    fontSize: 15,
    cursors: {}
});


export const EDITOR_UNLOADED = 'editor_unloaded';
export const EDITOR_LOADED = 'editor_loaded';
export const CREATE_CURSOR = 'cursor_create';

export const SET_CURSOR = 'cursor_set';
export const SET_FONT_SIZE = 'font_size';

export const BOLD = 'insert_bold';

export function texEditor(state = initialEditorState, action) {
    switch (action.type) {
        case EDITOR_LOADED:
            return state.set('editor', action.editor);

        case EDITOR_UNLOADED:
            return state.delete('editor');

        case CREATE_CURSOR:
            return state.set('cursor', action.cursor);

        case SET_CURSOR:
            const newCursor = state.get('cursor');
            newCursor.setCaret(action.valueType, action.value);
            return state.set('cursor', newCursor);

        case SET_FONT_SIZE:
            const fontSize = typeof action.fontSize === 'number'
                ? action.fontSize
                : (action.fontSize === '+'
                    ? state.get('fontSize') + 1
                    : state.get('fontSize') - 1
                  );
            return state.set('fontSize', fontSize);

        default:
            return state;
    }
}
