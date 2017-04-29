import {getCommand} from "../../../components/Editor/EditorContent/completion/command";
import {
    BOLD, CREATE_CURSOR, EDITOR_FULL, EDITOR_LOADED, EDITOR_TOGGLE_COMPACT, EDITOR_TOGGLE_MINIMAL, INSERT_IMAGE, REDO,
    SET_CURSOR,
    SET_FONT_SIZE, UNDO
} from "../../reducers/editor/texEditor";
import {Cursor} from "../../../api/Cursor";
import {getPhotosFolder} from "../../../api/google";
import {SERVICE_MAPPING} from "../../../const";

function initializeEditor(editor, dispatch) {
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

export async function insertImage(driveAPI, accessToken, picker) {
    const photosFolderID = await getPhotosFolder(driveAPI);

    const imageID = new Promise((resolve, reject) => {
        const callback = (data) => {
            if (data[picker.Response.ACTION] === picker.Action.PICKED) {
                const doc = data[picker.Response.DOCUMENTS][0];
                resolve({
                    type: INSERT_IMAGE,
                    service: SERVICE_MAPPING.hasOwnProperty(doc.serviceId) ? SERVICE_MAPPING[doc.serviceId] : doc.serviceId,
                    id: doc.id
                });
            } else if (data[picker.Response.ACTION] === picker.Action.CANCEL) {
                reject(data);
            }
        };
        const view = new picker.View(picker.ViewId.IMAGE_SEARCH);
        const driveView = new picker.View(picker.ViewId.DOCS_IMAGES);
        const driveUploadView = new picker.DocsUploadView().setParent(photosFolderID);

        const yourPhotos = new picker.ViewGroup(picker.ViewId.PHOTOS);
        yourPhotos.addView(new picker.PhotosView().setType(picker.PhotosView.Type.UPLOADED));

        const p = new picker.PickerBuilder()
            .addView(driveUploadView)
            .addView(driveView)
            .addView(picker.ViewId.PHOTO_UPLOAD)
            .addView(view)
            .addViewGroup(yourPhotos)
            .setOAuthToken(accessToken)
            .setCallback(callback)
            .build();
        p.setVisible(true);
    });

    return await imageID;
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

export function undo() {
    return { type: UNDO }
}

export function redo() {
    return { type: REDO }
}

export function fullEditor() {
    return { type: EDITOR_FULL }
}

export function toggleCompactEditor() {
    return { type: EDITOR_TOGGLE_COMPACT }
}
export function toggleMinimalEditor() {
    return { type: EDITOR_TOGGLE_MINIMAL }
}
