import {store} from './reducers';
import {downloadPdf, printPdf} from "./io";
import {openDocument} from "./google";

const printListener = (e) => {
    // CTRL + P
    if (e.ctrlKey && e.which === 80) {
        e.preventDefault();
        printPdf(store.getState());
    }
};

const openListener = (e, history) => {
    // CTRL + O
    if (e.ctrlKey && e.which === 79) {
        e.preventDefault();
        openDocument(history);
    }
};

const downloadListener = (e) => {
    // CTRL + ALT + D
    if (e.ctrlKey && e.altKey && e.which === 68) {
        e.preventDefault();
        downloadPdf(store.getState());
    }
};

const catchSave = (e) => {
    if (e.ctrlKey && e.which === 83) e.preventDefault();
};

export function registerKeybindings(target, history) {
    target.addEventListener('keydown', (e) => {
        printListener(e);
        openListener(e, history);
        downloadListener(e);
        catchSave(e);
    });
}
