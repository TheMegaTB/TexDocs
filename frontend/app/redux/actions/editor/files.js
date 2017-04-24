import {
    DOC_METADATA_LOADED, DOWNLOAD_PDF, DOWNLOAD_TEX, PDF_UPDATED, PRINT_PDF, REALTIME_DOC_LOADED,
    TEX_UPDATED
} from "../../reducers/editor/files";
import {DOC_CONTENT_ID} from "../../../const";

function onFileInitialize(model) {
    const string = model.createString(require("raw-loader!../../../static/templates/Generic.tex"));
    const cursors = model.createMap();

    model.getRoot().set(DOC_CONTENT_ID, string);
    model.getRoot().set(DOC_CURSORS_ID, cursors);
}

export function texChanged(newTex, local = true) {
    return {
        type: TEX_UPDATED,
        tex: newTex,
        local: local
    };
}

export function pdfChanged(newPDFBlob) {
    return {
        type: PDF_UPDATED,
        blob: newPDFBlob
    }
}

export function loadRealtimeDocument(realtime, id, dispatch) {
    const onContentUpdate = (e) => {
        if (!e.isLocal) {
            dispatch(texChanged(e.target.text, false));
        }
    };

    return new Promise((resolve, reject) => {
        realtime.load(id, (doc) => {

            const collabString = doc.getModel().getRoot().get(DOC_CONTENT_ID);

            collabString.addEventListener(realtime.EventType.TEXT_INSERTED, onContentUpdate);
            collabString.addEventListener(realtime.EventType.TEXT_DELETED, onContentUpdate);

            resolve({
                type: REALTIME_DOC_LOADED,
                document: doc
            });
        }, onFileInitialize, (err) => {
            alert(`Load failed (${err.error})!`);
            reject(err);
            throw JSON.stringify(err);
        });
    });
}

export function loadDocumentMetadata(client, id) {
    return new Promise(resolve => {
        const request = client.request({
            'path': '/drive/v3/files/' + id,
            'method': 'GET',
            'params': {
                'fields': 'name,modifiedTime,mimeType,id,explicitlyTrashed,lastModifyingUser,appProperties'
            }
        });
        request.execute(metadata => resolve({
            type: DOC_METADATA_LOADED,
            metadata: metadata
        }));
    });
}

export function printPDF() { return { type: PRINT_PDF } }
export function downloadPDF() { return { type: DOWNLOAD_PDF } }
export function downloadTex() { return { type: DOWNLOAD_TEX } }
