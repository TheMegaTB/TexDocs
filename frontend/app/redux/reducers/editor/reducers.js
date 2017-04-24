import {combineReducers} from "redux";
import {texEditor} from './texEditor';
import {files} from "./files";

const editor = combineReducers({
    texEditor,
    files
});

export default editor;
