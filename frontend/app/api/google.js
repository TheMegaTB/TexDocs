import {DOC_CONTENT_ID, DOC_CURSORS_ID, gapi} from '../const';
import { browserHistory } from 'react-router';

const realtimeUtils = new utils.RealtimeUtils({ clientId: gapi.clientId });

function onFileInitialize(model) {
    const string = model.createString(require("raw-loader!../static/templates/Generic.tex"));
    const cursors = model.createMap();

    model.getRoot().set(DOC_CONTENT_ID, string);
    model.getRoot().set(DOC_CURSORS_ID, cursors);
}

export function loadDocumentMetadata(store, documentID) {
    const request = window.gapi.client.request({
        'path': '/drive/v2/files/' + documentID,
        'method': 'GET',
    });
    request.execute(function(resp) {
        store.dispatch({type: 'DOC_METADATA_LOADED', title: resp.title, time: resp.modifiedDate, user: resp.lastModifyingUserName});
    });
}

export function loadDocument(store, documentID, onLoad) {
    const onFileLoaded = (doc) => {

        onLoad(doc);
        store.dispatch({type: 'DOC_LOADED', doc: doc});
    };
    const onLoadFail = (err) => {
        // TODO Do something with the error!
        console.error("Failed to load document", err);
        throw err;
    };
    window.gapi.drive.realtime.load(documentID, onFileLoaded, onFileInitialize, onLoadFail);
}

export function createDocument(name, cb) {
    realtimeUtils.createRealtimeFile(name, function(createResponse) {
        cb(createResponse.id);
    });
}

export function authorize(loadCB, authCB) {
    // Attempt to authorize
    realtimeUtils.authorize(function(response) {
        if (response.error) {
            // Authorization failed because this is the first time the user has used your application,
            // show the authorize button to prompt them to authorize manually.
            authCB(function () {
                realtimeUtils.authorize(function(response) {
                    if (!response.error) loadCB();
                    else console.error("Failed to authenticate!");
                }, true);
            });
        } else {
            loadCB();
        }
    }, false);
}
