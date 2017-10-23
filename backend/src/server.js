const WebSocket = require('ws');
const onConnection = require("./websocket.js").onConnection;

const express = require('express');
const path = require('path');
const http = require('http');
const app = express();

const root = path.join('..', 'frontend', 'build');

let wss;

// File serving
if (process.env.NODE_ENV === 'production') {
    const errorHandler = require('express-error-handler'),
    handler = errorHandler({
        static: {
            '404': path.join(root, 'index.html')
        }
    });

    app.use(express.static(root));
    app.use(errorHandler.httpError(404));

    // Handle all unhandled errors:
    app.use(handler);

    const server = http.createServer(app);

    wss = new WebSocket.Server({ server });

    // WebSocket server
    wss.on('connection', onConnection);

    server.listen(8080, function listening() {
        console.log('Listening on %d', server.address().port);
    });
} else {
    // Websocket serving
    const server = http.createServer(function(request, response) {
        // process HTTP request. Since we're writing just WebSockets server
        // we don't have to implement anything.
    });

    // create the server
    wss = new WebSocket.Server({
        httpServer: server
    });

    // WebSocket server
    wss.on('request', onConnection);

    server.listen(1337, function() { });
    console.log("Serving websocket for TexDocs on port 1337");
}