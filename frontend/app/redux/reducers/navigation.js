import {Map} from 'immutable';

const initialNavigationState = Map({
    history: undefined,
});

export const HISTORY_CREATED = 'history_created';
export const FILE_CREATED = 'file_created';
export const OPEN_DASHBOARD = 'navigate_dashboard';

export function navigation(state = initialNavigationState, action) {
    switch (action.type) {
        case HISTORY_CREATED:
            return state.set('history', action.history);
        case OPEN_DASHBOARD:
            state.get('history').push('/');
            return state;
        case FILE_CREATED:
            state.get('history').push('/d/' + action.id);
            return state;
        default:
            return state;
    }
}
