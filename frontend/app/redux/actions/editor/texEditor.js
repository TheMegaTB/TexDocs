import {getCommand} from "../../../components/Editor/EditorContent/completion/command";
import {BOLD, CREATE_CURSOR, EDITOR_LOADED, SET_CURSOR, SET_FONT_SIZE} from "../../reducers/editor/texEditor";
import {Cursor} from "../../../api/Cursor";

function initializeEditor(editor, dispatch) {
    console.log(editor.commands);
    editor.renderer.setScrollMargin(20, 20);

    editor.registerKeybinding = (keyCombo, action) => {
        const onKeyDown = (e) => {
            if ((keyCombo.ctrl && !e.ctrlKey) || (!keyCombo.ctrl && e.ctrlKey)) return;
            if ((keyCombo.alt && !e.altKey) || (!keyCombo.alt && e.altKey)) return;
            if ((keyCombo.meta && !e.metaKey) || (!keyCombo.meta && e.metaKey)) return;
            if (keyCombo.key !== e.which) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            if (typeof action === 'function') dispatch(action());
            else if (typeof action === 'string') dispatch({ type: action });
        };

        editor.container.addEventListener('keydown', onKeyDown);
        document.addEventListener('keydown', onKeyDown);
    };

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

    editor.registerKeybinding({ ctrl: true, key: 189 }, setFontSize.bind(null, '-'));
    editor.registerKeybinding({ ctrl: true, key: 187 }, setFontSize.bind(null, '+'));
    editor.registerKeybinding({ ctrl: true, key: 66 }, BOLD);
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
