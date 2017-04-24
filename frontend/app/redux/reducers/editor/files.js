import { Map } from 'immutable';
import {DOC_CONTENT_ID} from "../../../const";

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

function getCollaborativeString(document) {
    return document.getModel().getRoot().get(DOC_CONTENT_ID);
}

export function files(state = initialFileState, action) {
    switch (action.type) {
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

        default:
            return state;
    }
}
