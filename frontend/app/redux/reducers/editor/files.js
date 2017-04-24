import { Map } from 'immutable';

const initialFileState = Map({
    tex: "",
    pdf: new Blob()
});

export const TEX_LOADED = 'tex_loaded';
export const PDF_UPDATED = 'pdf_update';

export function files(state = initialFileState, action) {
    switch (action.type) {
        case TEX_LOADED:
            return state.set('tex', action.tex);
        case PDF_UPDATED:
            return state.set('pdf', action.blob);
        default:
            return state;
    }
}
