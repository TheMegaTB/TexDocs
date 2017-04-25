const WebSocketServer = require('websocket').server;
const http = require('http');
const express = require('express');
const onConnection = require("./websocket.js").onConnection;
const path = require('path');

const root = path.join('..', 'frontend', 'build');

// Websocket serving
const server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', onConnection);


server.listen(1337, function() { });
console.log("Serving websocket for TexDocs on port 1337");


// File serving
if (process.env.NODE_ENV === 'production') {
    const errorHandler = require('express-error-handler'),
        handler = errorHandler({
            static: {
                '404': path.join(root, 'index.html')
            }
        });

    const app = express();
    app.use(express.static(root));
    app.use(errorHandler.httpError(404));

    // Handle all unhandled errors:
    app.use(handler);

    app.listen(80, function () {
        console.log('Serving TexDocs on port 80!')
    });
}