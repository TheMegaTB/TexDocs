import * as Drive from '../../api/google';
import {FILE_CREATED, HISTORY_CREATED, OPEN_DASHBOARD} from "../reducers/navigation";
import createBrowserHistory from 'history/createBrowserHistory';

export function createHistory() {
    return {
        type: HISTORY_CREATED,
        history: createBrowserHistory()
    }
}

export async function createFile(driveAPI) {
    return {
        type: FILE_CREATED,
        id: await Drive.createFile(driveAPI)
    }
}

export function openDashboard() {
    return {
        type: OPEN_DASHBOARD
    }
}
