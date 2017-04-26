import {Map, List} from 'immutable';

const initialHomeState = Map({
    texFiles: List([]),
    thumbnails: Map({})
});

export const FILES_LISTED = 'files_listed';
export const THUMBNAIL_GENERATED = 'thumbnail_generated';

export function home(state = initialHomeState, action) {
    switch (action.type) {
        case FILES_LISTED:
            return state.set('texFiles', List(action.files));
        case THUMBNAIL_GENERATED:
            return state.set('thumbnails', state.get('thumbnails').set(action.id, action.thumbnail));
        default:
            return state;
    }
}
