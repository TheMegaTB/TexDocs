import { Map } from 'immutable';

const initialGAPIState = Map({
    // api: {
    //     auth: ...,
    //     auth2: ...,
    //     realtime: ...,
    //     client: ...
    // },
    // gAuth: ...,
    // user: {
    //     id: ...,
    //     name: ...,
    //     image: ...,
    //     email: ...
    // },
    // accessToken: ...,
    // tokenRefresher: ...
});

export const API_LOADED = 'api_loaded';
export const AUTH_INITIALIZED = 'auth_init';
export const AUTHORIZED = 'authorized';
export const TOKEN_REFRESH = 'token_refresh';
export const TOKEN_REFRESHER_REGISTERED = 'token_refresher_register';

import {WS} from '../../const';

export function googleAPI(state = initialGAPIState, action) {
    switch (action.type) {
        case API_LOADED:
            return state.set('api',
                {
                    auth: window.gapi.auth,
                    auth2: window.gapi.auth2,
                    realtime: window.gapi.drive.realtime,
                    client: window.gapi.client
                }
            );
        case AUTH_INITIALIZED:
            return state.set('gAuth', action.gAuth);
        case AUTHORIZED:
            return state.set('user', action.user);
        case TOKEN_REFRESH:
            WS.send(JSON.stringify({
                type: 'auth',
                token: action.fullToken
            }));
            return state.set('accessToken', action.token);
        case TOKEN_REFRESHER_REGISTERED:
            return state.set('tokenRefresher', action.intervalID);
        default:
            return state;
    }
}
