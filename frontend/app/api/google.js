import {
    CLIENT_ID, DOC_CONTENT_ID, DOC_CURSORS_ID, DRIVE_MIME_TYPE, MIME_TYPE, SCOPES,
    TOKEN_REFRESH_INT
} from "../const";
import { browserHistory } from 'react-router';

import { Map } from 'immutable';

let pickerOpen = false;

function openDocumentCallback(history, cb, data) {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        const doc = data[google.picker.Response.DOCUMENTS][0];
        if (typeof cb === 'function') cb();
        history.push('/d/' + doc.id);
        pickerOpen = false;
    }
}

export function openDocument(history, callback) {
    if (pickerOpen) return;
    pickerOpen = true;
    // Create and render a Picker object for picking user Photos.
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(DRIVE_MIME_TYPE);

    const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(window.access_token)
        .setCallback(openDocumentCallback.bind(null, history, callback))
        .setSelectableMimeTypes(DRIVE_MIME_TYPE)
        .build(); //setDeveloperKey(developerKey).
    picker.setVisible(true);
}

export function createDocument(name, history) {
    window.gapi.client.load('drive', 'v2', function () {
        const insertHash = {
            'resource': {
                mimeType: DRIVE_MIME_TYPE,
                title: name,
                fileExtension: 'pdf',
                appProperties: {
                    latex: true
                }
            }
        };
        window.gapi.client.drive.files.insert(insertHash).execute((doc) => {
            console.log(doc);
            history.push('/d/' + doc.id);
        });
    });
}

function onFileInitialize(model) {
    const string = model.createString(require("raw-loader!../static/templates/Generic.tex"));
    const cursors = model.createMap();

    model.getRoot().set(DOC_CONTENT_ID, string);
    model.getRoot().set(DOC_CURSORS_ID, cursors);
}

export function loadDocumentMetadata(store, documentID) {
    const request = window.gapi.client.request({
        'path': '/drive/v3/files/' + documentID,
        'method': 'GET',
        'params': {
            'fields': 'name,modifiedTime,mimeType,id,explicitlyTrashed,lastModifyingUser,appProperties'
        }
    });
    request.execute(function(resp) {
        if (resp.explicitlyTrashed) {
            // TODO Improve this
            alert("Document is in the trash!");
        }
        store.dispatch({ type: 'DOC_METADATA_LOADED', metadata: resp });
    });
}

export function loadDocument(store, documentID, onLoad) {
    const onFileLoaded = (doc) => {
        store.dispatch({type: 'DOC_LOADED', doc: doc});
        onLoad(doc);
    };
    window.gapi.drive.realtime.load(documentID, onFileLoaded, onFileInitialize, onError);
}

function refreshToken(cb) {
    window.gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: true
    }, (res) => {
        window.access_token = res.access_token;
        if (typeof cb === 'function') cb();
    });
}

/**
 * Update an existing file's metadata and content.
 *
 * @param {Object} fileMetadata existing Drive file's metadata.
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Callback function to call when the request is complete.
 */
export function updateFile(fileMetadata, fileData, callback) {
    const fileId = fileMetadata.id;
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
        mimeType: fileMetadata.mimeType,
        name: fileMetadata.name,
        trashed: fileMetadata.trashed,
        modifiedTime: new Date().toISOString(),
        appProperties: {
            latex: true
        }
    };

    const reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
        const contentType = fileData.type || 'application/octet-stream';
        // Updating the metadata is optional and you can instead use the value from drive.files.get.
        const base64Data = btoa(reader.result);
        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        const request = gapi.client.request({
            'path': '/upload/drive/v3/files/' + fileId,
            'method': 'PATCH',
            'params': {
                'uploadType': 'multipart',
                'alt': 'json',
                'ocr': true
            },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        if (!callback) {
            callback = function(file) {
                // console.log(file)
            };
        }
        request.execute(callback);
    }
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
    window.gapi.load('auth2,auth:client,drive-realtime,drive-share,picker', function () {
        window.auth2 = window.gapi.auth2.init({
            client_id: CLIENT_ID,
            scope: 'profile email openid ' + SCOPES.join(' ')
        });

        // Sign the user in, and then retrieve their ID.
        auth2.then(function () {
            if (!auth2.isSignedIn.get()) {
                authCB(() => {
                    auth2.signIn().then(onAuth.bind(null, store, loadCB));
                });
            } else {
                onAuth(store, loadCB);
            }
        }, (err) => {
            console.error("Could not authorize", err);
        });
    });
}
