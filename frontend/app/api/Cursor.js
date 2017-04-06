import {DOC_CURSORS_ID, CURSOR_WATCHDOG_INTERVAL, CURSOR_TIMEOUT} from "../const";

export let Cursor = function (document, sessionID) {

    this.doc = document;
    this.collaborativeMap = document.getModel().getRoot().get(DOC_CURSORS_ID);
    this.id = sessionID;

    this.init = () => {
        this.collaborativeMap.set(this.id, this.doc.getModel().createMap({
            caret: '0,0',
            lastUpdate: (new Date()).getTime(),
        }));

        const cursor = this;
        this.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, (event) => {
            cursor.cleanup(event.collaborator.sessionId);
        });
    };

    this.setCaret = (index) => {
        let state = this.collaborativeMap.get(this.id);
        state.set('caret', index);
        this.collaborativeMap.set(this.id, state);
    };

    this.tick = () => {
        let state = this.collaborativeMap.get(this.id);
        state.set('lastUpdate', (new Date()).getTime());
        this.collaborativeMap.set(this.id, state);

        this.cleanup();

        console.log(this.getCursors());
    };

    this.cleanup = (id) => {
        if (id)
            this.collaborativeMap.delete(id);
        else
            this.collaborativeMap.items().forEach((item) => {
                const sID = item[0];
                const state = item[1];
                const delta = new Date() - state.get('lastUpdate');
                if (delta > CURSOR_TIMEOUT) this.collaborativeMap.delete(sID);
            });
    };

    this.getCursors = () => {
        return this.collaborativeMap.items().map((item) => item[1].get('caret'));
    };


    this.init();
    this.cleanup();

    this.watchdog = setInterval(this.tick, CURSOR_WATCHDOG_INTERVAL);
};
