import {gapi} from '../const';
import { browserHistory } from 'react-router';

const realtimeUtils = new utils.RealtimeUtils({ clientId: gapi.clientId });
const stringID = 'Main.tex';

function onFileInitialize(model) {
    const string = model.createString();
    string.setText(require("raw-loader!../static/templates/Generic.tex"));
    model.getRoot().set(stringID, string);
}

export function loadDocument(documentID, cb) {
    const onFileLoaded = (doc) => {
        const collaborativeString = doc.getModel().getRoot().get(stringID);
        cb(collaborativeString);
    };
    realtimeUtils.load(documentID, onFileLoaded, onFileInitialize);
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
