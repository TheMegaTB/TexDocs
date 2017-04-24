import {combineReducers} from "redux";
import editor from "./reducers/editor/reducers";
import {googleAPI} from "./reducers/gapi";

const texDocsApp = combineReducers({
    editor,
    googleAPI
});

export default texDocsApp;
