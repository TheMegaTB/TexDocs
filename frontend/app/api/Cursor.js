import {DOC_CURSORS_ID, CURSOR_WATCHDOG_INTERVAL, CURSOR_TIMEOUT} from "../const";
import {getTime} from "./time";

export let Cursor = function (document, sessionID, onExternalChange) {

    this.doc = document;
    this.collaborativeMap = document.getModel().getRoot().get(DOC_CURSORS_ID);
    this.id = sessionID;

    this.init = () => {
        const caret = document.getModel().createMap({
            anchor: { row: 0, column: 0 },
            lead: { row: 0, column: 0 }
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
                        onExternalChange(this.getCursor(sID));

                        const caret = item[1].get('caret');
                        caret.removeAllEventListeners();
                        caret.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (e) => {
                            onExternalChange(this.getCursor(e.sessionId));
                        });
                    }
                });
            });
        }

        const cursor = this;
        this.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, (e) => {
            onExternalChange(cursor.getCursor(e.collaborator.sessionId));
        });
        this.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, (event) => {
            cursor.cleanup(event.collaborator.sessionId);
            onExternalChange({
                anchor: {},
                lead: {},
                sessonID: event.collaborator.sessionId
            });
        });
    };

    this.setCaret = (type, value) => {
        if (type !== 'anchor' && type !== 'lead') return;
        let state = this.collaborativeMap.get(this.id);
        const caret = state.get('caret');
        caret.set(type, value);
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

    this.getCursor = (sessionID) => {
        const collaborator = this.doc.getCollaborators().find((collab) => collab.sessionId === sessionID);
        if (collaborator === undefined || !this.collaborativeMap.has(sessionID)) return;
        const caret = this.collaborativeMap.get(sessionID).get('caret');

        return {
            anchor: caret.get('anchor'),
            lead: caret.get('lead'),
            name: collaborator.displayName,
            color: collaborator.color,
            sessionID: sessionID
        }
    };

    this.getCursors = () => {
        const cursors = {};
        const collaborators = {};
        const sessionID = this.id;

        this.doc.getCollaborators().forEach((collab) => {
            if (collab.sessionId !== sessionID)
                collaborators[collab.sessionId] = collab
        });

        this.collaborativeMap.items().forEach((item) => {
            const sID = item[0];
            const caret = item[1].get('caret');
            if (collaborators[sID]) {
                cursors[sID] = {
                    anchor: caret.get('anchor'),
                    lead: caret.get('lead'),
                    name: collaborators[sID].displayName,
                    color: collaborators[sID].color,
                    sessionID: sID
                };
            }
        });

        return cursors;
    };


    this.init();
    this.cleanup();

    this.watchdog = setInterval(this.tick, CURSOR_WATCHDOG_INTERVAL);
};
