import {combineReducers} from "redux";
import {files} from "./reducers/files";
import {editor} from "./reducers/editor";
import {googleAPI} from "./reducers/gapi";

const texDocsApp = combineReducers({
    editor,
    files,
    googleAPI
});

export default texDocsApp;
