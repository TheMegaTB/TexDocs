import {combineReducers} from "redux";
import editor from "./reducers/editor/reducers";
import {googleAPI} from "./reducers/gapi";
import {home} from "./reducers/home";
import {navigation} from './reducers/navigation';

const texDocsApp = combineReducers({
    home,
    editor,
    googleAPI,
    navigation
});

export default texDocsApp;
