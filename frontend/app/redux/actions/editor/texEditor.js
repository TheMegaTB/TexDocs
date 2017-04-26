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

export function insertImage(accessToken, picker) {


    // window.gapi.client.drive.files.list({
    //     key: API_KEY,
    //     q: "mimeType='application/vnd.google-apps.folder' and name='Photos'"
    // }, (err, res) => {
    //     console.log("REQUEST DONE", err, res);
    // }).execute((a) => {console.log(a)});

    return new Promise((resolve, reject) => {
        const callback = (data) => {
            console.log(data);
            if (data[picker.Response.ACTION] === picker.Action.PICKED) {
                var doc = data[picker.Response.DOCUMENTS][0];
                // url = doc[picker.Document.URL];
                resolve(doc);
            } // TODO Reject
        };
        const view = new picker.View(picker.ViewId.IMAGE_SEARCH);
        const driveView = new picker.View(picker.ViewId.DOCS_IMAGES);
        const driveUploadView = new picker.DocsUploadView().setParent('1FeLIjh1iHCdE3SKHDcpvDeVAjVy9fRDy6K5D62Af660');

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
        //  .setDeveloperKey(developerKey)
        p.setVisible(true);
    });
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
