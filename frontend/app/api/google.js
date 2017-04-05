import {CLIENT_ID, DOC_CONTENT_ID, DOC_CURSORS_ID, SCOPES} from "../const";
import {browserHistory} from "react-router";

// const realtimeUtils = new utils.RealtimeUtils({ clientId: gapi.clientId });
//
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
//
// export function createDocument(name, cb) {
//     realtimeUtils.createRealtimeFile(name, function(createResponse) {
//         cb(createResponse.id);
//     });
// }

function onAuth(loadCB) {
    window.gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: false
    }, () => {
    });

    const googleUser = auth2.currentUser.get();
    const profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    //TODO dispatch event
    loadCB();
}

export function authorize(loadCB, authCB) {
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
                onAuth(loadCB);
            }
        });
    });
}
