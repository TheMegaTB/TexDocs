import {getCommand} from "../../../components/Editor/EditorContent/completion/command";
import {CREATE_CURSOR, EDITOR_LOADED, SET_CURSOR, SET_FONT_SIZE} from "../../reducers/editor/texEditor";
import {Cursor} from "../../../api/Cursor";

function initializeEditor(editor, dispatch) {
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
        dispatch(setCaret('anchor', e.value));
    });
    selection.selectionLead.addEventListener('change', (e) => {
        dispatch(setCaret('lead', e.value));
    });

    editor.container.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.which === 189) {
            e.preventDefault();
            dispatch(setFontSize('-'));
        } else if (e.ctrlKey && e.which === 187) {
            e.preventDefault();
            dispatch(setFontSize('+'));
        }
    });
}

export function editorLoaded(editor, dispatch) {
    initializeEditor(editor, dispatch);
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
