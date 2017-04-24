import { createStore } from 'redux';
import { Map } from 'immutable';
import {secondsToString} from "./time";

const defaultState = Map({
    loaded: false,
    saved: false,
    collaborators: Map({}),
    sessionID: '',
    pdfURL: new Blob(),
    attributes: Map({
        readOnly: true,
        bytesUsed: 0,
        lastEdit: 'Last edit is unknown.'
    }),
    metadata: Map({
        name: ""
    }),
    user: Map({
        id: "",
        name: "",
        image: "",
        email: ""
    })
});

export const store = createStore(reducer);

function onCollaboratorJoined(event) {
    store.dispatch({type: 'DOC_COLLABORATOR_JOINED', collaborator: event.collaborator});
}

function onCollaboratorLeft(event) {
    store.dispatch({type: 'DOC_COLLABORATOR_LEFT', collaborator: event.collaborator, doc: event.target});
}

function onSaveStateChange(event) {
    store.dispatch({type: 'DOC_SAVE_STATE_CHANGED', isSaving: event.isSaving});
}

function reducer(state = defaultState, action) {
    switch (action.type) {
        case 'DOC_METADATA_LOADED':
            const timeDelta = secondsToString((new Date() - new Date(action.metadata.modifiedTime))/1000);
            const lastEdit = action.metadata.lastModifyingUser.displayName === state.get('user').get('name')
                                ? "Last edit was " + timeDelta + " ago"
                                : "Last edit was made " + timeDelta + " ago by " + action.metadata.lastModifyingUserName;
            return state.mergeDeep({
                metadata: action.metadata,
                attributes: {
                    name: action.metadata.name,
                    lastEdit: lastEdit
                }
            });
        case 'DOC_LOADED':
            const EventType = gapi.drive.realtime.EventType;

            const model = action.doc.getModel();
            action.doc.addEventListener(EventType.COLLABORATOR_JOINED, onCollaboratorJoined);
            action.doc.addEventListener(EventType.COLLABORATOR_LEFT, onCollaboratorLeft);
            action.doc.addEventListener(EventType.DOCUMENT_SAVE_STATE_CHANGED, onSaveStateChange);

            let sessionID;
            let collaborators = Map({});
            action.doc.getCollaborators().forEach((collaborator) => {
                if (collaborator.isMe) sessionID = collaborator.sessionId;
                collaborators = collaborators.set(collaborator.sessionId, collaborator);
            });

            return state.mergeDeep({
                loaded: true,
                saved: true,
                collaborators: collaborators,
                sessionID: sessionID,
                attributes: {
                    readOnly: model.isReadOnly,
                    bytesUsed: model.bytesUsed
                }
            });
        case 'DOC_UNLOADED':
            action.doc.removeAllEventListeners();
            action.doc.close();

            return state.merge({
                loaded: false,
                saved: false,
                collaborators: defaultState.get('collaborators'),
                attributes: defaultState.get('attributes')
            });
        case 'DOC_COLLABORATOR_JOINED':
            return state.set('collaborators',
                state.get('collaborators').set(action.collaborator.sessionId, action.collaborator));
        case 'DOC_COLLABORATOR_LEFT':
            // TODO Remove their cursor from document
            return state.delete(action.collaborator.sessionId);
        case 'DOC_SAVE_STATE_CHANGED':
            return state.set('saved', !action.isSaving);
        case 'AUTHORIZED':
            return state.set('user', action.user);
        case 'PDF_LOADED':
            if (state.get('pdfURL')) window.URL.revokeObjectURL(state.get('pdfURL'));
            return state.set('pdfURL', action.url);
        default:
            return state;
    }
}
