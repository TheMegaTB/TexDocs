import {CLIENT_ID, DOC_CONTENT_ID, DOC_CURSORS_ID, MIME_TYPE, SCOPES, TOKEN_REFRESH_INT} from "../const";
import { browserHistory } from 'react-router';

import { Map } from 'immutable';

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
    window.gapi.drive.realtime.load(documentID, onFileLoaded, onFileInitialize, onError);
}

export function createDocument(name, cb) {
    window.gapi.client.load('drive', 'v2', function () {
        const insertHash = {
            'resource': {
                mimeType: MIME_TYPE,
                title: name
            }
        };
        window.gapi.client.drive.files.insert(insertHash).execute(cb);
    });
}

function refreshToken(cb) {
    window.gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: true
    }, () => {
        if (typeof cb === 'function') cb();
    });
}

function onError(error) {
    const ErrorType = window.gapi.drive.realtime.ErrorType;
    if (error.type === ErrorType.TOKEN_REFRESH_REQUIRED) {
        refreshToken();
    } else if (error.type === ErrorType.CLIENT_ERROR) {
        alert('An Error happened: ' + error.message);
        window.location.href = '/';
    } else if (error.type === ErrorType.NOT_FOUND) {
        alert('The file was not found. It does not exist or you do not have ' +
            'read access to the file.');
        window.location.href = '/';
    } else if (error.type === ErrorType.FORBIDDEN) {
        alert('You do not have access to this file. Try having the owner share' +
            'it with you from Google Drive.');
        window.location.href = '/';
    }
}

function onAuth(store, loadCB) {
    setInterval(refreshToken, TOKEN_REFRESH_INT);
    refreshToken(loadCB);

    const profile = auth2.currentUser.get().getBasicProfile();
    store.dispatch({type: 'AUTHORIZED', user: Map({
        id: profile.getId(),
        name: profile.getName(),
        image: profile.getImageUrl(),
        email: profile.getEmail()
    })});
}

export function authorize(store, loadCB, authCB) {
    window.gapi.load('auth2,auth:client,drive-realtime,drive-share', function () {
        window.auth2 = window.gapi.auth2.init({
            client_id: CLIENT_ID,
            scope: 'profile email openid ' + SCOPES.join(' '),
        });

        // Sign the user in, and then retrieve their ID.
        auth2.then(function () {
            if (!auth2.isSignedIn.get()) {
                authCB(() => {
                    auth2.signIn().then(onAuth.bind(null, loadCB));
                });
            } else {
                onAuth(store, loadCB);
            }
        });
    });
}
