import { Map } from 'immutable';
import {TEX_UPDATED} from "./files";

const initialEditorState = Map({
    // editor: ...,
    // cursor: ...,
    fontSize: 15,
    cursors: {},
    mode: 'full'
});


export const EDITOR_FULL = 'full_editor';
export const EDITOR_COMPACT = 'compact_editor';
export const EDITOR_TOGGLE_COMPACT = 'toggle_compact_editor';
export const EDITOR_MINIMAL = 'minimal_editor';
export const EDITOR_TOGGLE_MINIMAL = 'toggle_minimal_editor';

export const EDITOR_UNLOADED = 'editor_unloaded';
export const EDITOR_LOADED = 'editor_loaded';
export const CREATE_CURSOR = 'cursor_create';

export const INSERT_IMAGE = 'image_insert';

export const SET_CURSOR = 'cursor_set';
export const SET_FONT_SIZE = 'font_size';

export const BOLD = 'insert_bold';

export const UNDO = 'undo';
export const REDO = 'redo';

export let skipCursorUpdates = 0;

function resizeEditor(editor) {
    setTimeout(() => {
        editor.resize();
    }, 1000);
}

export function texEditor(state = initialEditorState, action) {
    switch (action.type) {
        case EDITOR_LOADED:
            return state.set('editor', action.editor);

        case EDITOR_UNLOADED:
            return state.delete('editor');

        case CREATE_CURSOR:
            return state.set('cursor', action.cursor);

        case TEX_UPDATED:
            if (!action.local) skipCursorUpdates = 4; // two for the cursor @ 0:0 and two for 0:EOF
            return state;

        case SET_CURSOR:
            if (skipCursorUpdates > 0) {
                skipCursorUpdates--;
                return state;
            }
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

        case EDITOR_FULL:
            resizeEditor(state.get('editor'));
            return state.set('mode', 'full');
        case EDITOR_COMPACT:
            resizeEditor(state.get('editor'));
            return state.set('mode', 'compact');
        case EDITOR_TOGGLE_COMPACT:
            resizeEditor(state.get('editor'));
            return state.set('mode', state.get('mode') === 'compact' ? 'full' : 'compact');
        case EDITOR_MINIMAL:
            resizeEditor(state.get('editor'));
            return state.set('mode', 'minimal');
        case EDITOR_TOGGLE_MINIMAL:
            resizeEditor(state.get('editor'));
            return state.set('mode', state.get('mode') === 'minimal' ? 'full' : 'minimal');

        default:
            return state;
    }
}
