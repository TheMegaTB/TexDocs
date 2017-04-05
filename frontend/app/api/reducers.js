import { createStore } from 'redux';
import { Map } from 'immutable';
import {secondsToString} from "./time";

const defaultState = Map({
    loaded: false,
    saved: false,
    collaborators: Map({}),
    attributes: Map({
        readOnly: true,
        bytesUsed: 0,
        title: 'Untitled',
        lastEdit: 'Last edit is unknown.'
    }),
    user: Map({
        id: "",
        name: "",
        image: "",
        email: ""
    })
});

// export let document = undefined;
export const store = createStore(reducer);

function onCollaboratorJoined(event) {
    store.dispatch({type: 'DOC_COLLABORATOR_JOINED', collaborator: event.collaborator});
}

function onCollaboratorLeft(event) {
    store.dispatch({type: 'DOC_COLLABORATOR_LEFT', collaborator: event.collaborator});
}

function onSaveStateChange(event) {
    store.dispatch({type: 'DOC_SAVE_STATE_CHANGED', isSaving: event.isSaving});
}

function reducer(state = defaultState, action) {
    switch (action.type) {
        case 'DOC_METADATA_LOADED':
            const timeDelta = secondsToString((new Date() - new Date(action.time))/1000);
            const lastEdit = action.user === state.get('user').get('name')
                                ? "Last edit was " + timeDelta + " ago"
                                : "Last edit was made " + timeDelta + " ago by " + action.user;
            return state.mergeDeep({
                attributes: {
                    title: action.title,
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

            console.log("Current session ID:", sessionID);

            // TODO Cleanup deprecated cursors if no collabs are connected
            // TODO Add my own cursor

            return state.mergeDeep({
                loaded: true,
                saved: true,
                collaborators: collaborators,
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
        default:
            return state;
    }
}

store.subscribe(() => {
    const obj = store.getState().toObject();
    obj.collaborators = obj.collaborators.toObject();
    obj.attributes = obj.attributes.toObject();
    console.log(obj);
});
