const WebSocketServer = require('websocket').server;
const http = require('http');
const path = require('path');
const fs = require('mz/fs');
const exec = require('mz/child_process').exec;
const execFile = require('mz/child_process').execFile;


function createTempDir() {
    return exec('mktemp -d').then((res) => res[0].trim());
}

function generatePDF(dir) {
    return execFile(path.join(__dirname, 'buildPDF.sh'), [dir]);
}

const server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    const userDir = createTempDir();

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            userDir.then((dir) => {
                fs.writeFile(path.join(dir, 'tmp.tex'), message.utf8Data).then(
                    generatePDF(dir).then((log) => {
                        console.log(dir, log);
                        // TODO Send log and linting data to client
                        fs.readFile(path.join(dir, 'tmp.pdf')).then((data) => {
                            connection.send(data, {binary: true});
                        });
                    })
                );
            });
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});