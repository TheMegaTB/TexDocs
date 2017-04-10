import {DOC_CURSORS_ID, CURSOR_WATCHDOG_INTERVAL, CURSOR_TIMEOUT} from "../const";
import {getTime} from "./time";

export let Cursor = function (document, sessionID, onExternalChange) {

    this.doc = document;
    this.collaborativeMap = document.getModel().getRoot().get(DOC_CURSORS_ID);
    this.id = sessionID;

    this.init = () => {
        const caret = document.getModel().createMap({
            start: 0,
            end: 0,
            backward: false
        });
        this.collaborativeMap.set(this.id, this.doc.getModel().createMap({
            caret: caret,
            lastUpdate: getTime(),
        }));

        if (typeof onExternalChange === 'function') {
            this.collaborativeMap.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (data) => {
                const cursors = data.target.items();
                cursors.forEach((item) => {
                    const sID = item[0];
                    if (sID !== sessionID) {
                        const caret = item[1].get('caret');
                        caret.removeAllEventListeners();
                        caret.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, onExternalChange);
                    }
                });
            });
        }

        const cursor = this;
        this.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, (event) => {
            cursor.cleanup(event.collaborator.sessionId);
        });
    };

    this.setCaret = (start, end, backward) => {
        let state = this.collaborativeMap.get(this.id);
        const caret = state.get('caret');
        caret.set('start', start);
        caret.set('end', end);
        caret.set('backward', backward);
        state.set('caret', caret);
        this.collaborativeMap.set(this.id, state);
    };

    this.tick = () => {
        if (!this.collaborativeMap.has(this.id))
            this.init();
        let state = this.collaborativeMap.get(this.id);
        state.set('lastUpdate', getTime());
        this.collaborativeMap.set(this.id, state);

        this.cleanup();
    };

    this.cleanup = (id) => {
        if (id)
            this.collaborativeMap.delete(id);
        else
            this.collaborativeMap.items().forEach((item) => {
                const sID = item[0];
                const state = item[1];
                const delta = getTime() - state.get('lastUpdate');
                if (delta > CURSOR_TIMEOUT) this.collaborativeMap.delete(sID);
            });
    };

    this.getCursors = () => {
        const cursors = {};
        const collaborators = {};
        const sessionID = this.id;

        this.doc.getCollaborators().forEach((collab) => collaborators[collab.sessionId] = collab);
        this.collaborativeMap.items().forEach((item) => {
            const sID = item[0];
            if (sID !== sessionID && collaborators[sID]) {
                cursors[item[1].get('caret').get('start')] = {
                    name: collaborators[sID].displayName,
                    color: collaborators[sID].color
                }
            }
        });

        return cursors;
    };


    this.init();
    this.cleanup();

    this.watchdog = setInterval(this.tick, CURSOR_WATCHDOG_INTERVAL);
};
