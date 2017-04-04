const defaultState = {
    authenticated: false
};
export default function(state = defaultState, action) {
    switch (action.type) {
        case 'AUTHENTICATED':
            state.authenticated = true;
            break;
        case 'UNAUTHENTICATE':
            // TODO unauthenticate google account
            state.authenticated = false;
    }

    return state;
}
