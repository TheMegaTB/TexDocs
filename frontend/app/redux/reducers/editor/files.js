import { Map } from 'immutable';
import {DOC_CONTENT_ID, MIME_TYPE} from "../../../const";
import {EDITOR_UNLOADED} from "./texEditor";

const initialFileState = Map({
    // tex: "",
    // pdf: new Blob(),
    // document: ...,
    // metadata: ...,
    // sessionID: ...
});

export const REALTIME_DOC_LOADED = 'realtime_doc_loaded';
export const DOC_METADATA_LOADED = 'doc_metadata_loaded';
export const TEX_UPDATED = 'tex_update';
export const PDF_UPDATED = 'pdf_update';

export const DOWNLOAD_TEX = 'download_tex';
export const DOWNLOAD_PDF = 'download_pdf';
export const PRINT_PDF = 'print_pdf';

function getCollaborativeString(document) {
    return document.getModel().getRoot().get(DOC_CONTENT_ID);
}

function downloadFile(url, filename) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    setTimeout(() => {
        a.click();
        a.parentNode.removeChild(a);
    }, 1000);
}

export function files(state = initialFileState, action) {
    switch (action.type) {
        case EDITOR_UNLOADED:
            return state.delete('tex').delete('pdf').delete('document').delete('metadata').delete('sessionID');

        case REALTIME_DOC_LOADED:
            const collabString = getCollaborativeString(action.document);
            const me = action.document.getCollaborators().find((collaborator) => collaborator.isMe);
            const sessionID = me ? me.sessionId : undefined;
            return state
                .set('document', action.document)
                .set('tex', collabString.toString())
                .set('sessionID', sessionID);

        case DOC_METADATA_LOADED:
            return state.set('metadata', action.metadata);

        case TEX_UPDATED:
            if (action.local) getCollaborativeString(state.get('document')).setText(action.tex);
            return state.set('tex', action.tex);

        case PDF_UPDATED:
            return state.set('pdf', action.blob);

        case DOWNLOAD_TEX:
            const fileName = state.get('metadata').name + '.tex';
            const text = `data:${MIME_TYPE};charset=utf-8,${encodeURIComponent(state.get('tex'))}`;
            downloadFile(text, fileName);
            return state;

        case DOWNLOAD_PDF:
            const url = window.URL.createObjectURL(state.get('pdf'));
            downloadFile(url, state.get('metadata').name + '.pdf');
            return state;

        case PRINT_PDF:
            const iframe = document.getElementById('print-target');
            iframe.style.display = 'none';
            iframe.onload = function() {
                setTimeout(function() {
                    iframe.focus();
                    iframe.contentWindow.print();
                }, 1);
            };
            iframe.src = window.URL.createObjectURL(state.get('pdf'));
            return state;

        default:
            return state;
    }
}
