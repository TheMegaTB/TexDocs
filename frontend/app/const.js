const WebSocket = require('reconnecting-websocket');

export const target = document.getElementById('render-target');

export const gapi = {
    clientId: '367816881553-mnu299ct2iokf5vhbg9t07dvchg342g4.apps.googleusercontent.com',
    drive: {
        fileID: '0Bwkm3KQJFmKsVWU1Q3lZU0c5TzA'
    }
};

export const DOC_CONTENT_ID = 'doc_main';
export const DOC_CURSORS_ID = 'doc_cursors';

export const CURSOR_WATCHDOG_INTERVAL = 15000;
export const CURSOR_TIMEOUT = 10000 + CURSOR_WATCHDOG_INTERVAL;

export const SEARCH_QUERY = "appProperties has { key='latex' and value='true' }";
export const MIME_TYPE = 'application/x-latex';
export const DRIVE_MIME_TYPE = 'application/pdf';
export const TOKEN_REFRESH_INT = 1800000; // 30 minutes
export const CLIENT_ID = '367816881553-mnu299ct2iokf5vhbg9t07dvchg342g4.apps.googleusercontent.com';
export const API_KEY = 'AIzaSyAh-8jFkW3eoXMp_qT6obuUOX-WnGFS43U';
export const SCOPES = [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/photos'
];

export const SERVICE_MAPPING = {
    docs: "GDrive"
};

export const RENDER_DELAY = 250;

export const WS_URL = "ws://" + window.location.hostname + ":1337/";
export const WS = new WebSocket(WS_URL);

export const TIME_DEBUG = false;

export const NEW_DOC_NAME = "Untitled tex document";
