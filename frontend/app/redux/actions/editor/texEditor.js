import {getCommand} from "../../../components/Editor/AceEditorContent/completion/command";
import {CREATE_CURSOR, EDITOR_LOADED, SET_CURSOR, SET_FONT_SIZE} from "../../reducers/editor/texEditor";
import {Cursor} from "../../../api/Cursor";

function initializeEditor(editor, store) {
    editor.renderer.setScrollMargin(20, 20);

    const autoCompleteOn = ['insertstring', 'backspace', 'del'];
    editor.commands.on("afterExec", function(e) {
        if (autoCompleteOn.find((el) => el === e.command.name)) {
            const cmd = getCommand(editor);
            if (cmd && cmd.cmd.value && !editor.getSession().selectionMarkerCount) {
                editor.execCommand("startAutocomplete");
            }
        }
    });

    const selection = editor.session.getSelection();

    selection.selectionAnchor.addEventListener('change', (e) => {
        store.dispatch(setCaret('anchor', e.value));
    });
    selection.selectionLead.addEventListener('change', (e) => {
        store.dispatch(setCaret('lead', e.value));
    });

    editor.container.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.which === 189) {
            e.preventDefault();
            store.dispatch(setFontSize(store.getState().editor.texEditor.get('fontSize') - 1));
        } else if (e.ctrlKey && e.which === 187) {
            e.preventDefault();
            store.dispatch(setFontSize(store.getState().editor.texEditor.get('fontSize') + 1));
        }
    });
}

export function editorLoaded(editor, store) {
    initializeEditor(editor, store);
    return {
        type: EDITOR_LOADED,
        editor: editor
    };
}

export function createCursor(document, sessionID, cb) {
    return {
        type: CREATE_CURSOR,
        cursor: new Cursor(
            document,
            sessionID,
            cb
        )
    }
}

export function setCaret(type, value) {
    return {
        type: SET_CURSOR,
        valueType: type,
        value: value
    }
}

export function setFontSize(fontSize) {
    return {
        type: SET_FONT_SIZE,
        fontSize: fontSize
    }
}
