const WebSocketServer = require('websocket').server;
const http = require('http');
const express = require('express');
const path = require('path');
const nodeFS = require('fs');
const fs = require('mz/fs');
const exec = require('mz/child_process').exec;
const execFile = require('mz/child_process').execFile;
const rimraf = require('rimraf');
const uuidV4 = require('uuid/v4');
const spawn = require('child_process').spawn;

const root = path.join('..', 'frontend', 'build');
const PROGRESS_INJECTION = `
\\usepackage{everyshi}
\\EveryShipout{\\message{^^JHELLO \\thepage^^J}}
`;

// Websocket serving
const server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

const jobs = {};

function createTempDir() {
    return exec('mktemp -d').then((res) => res[0].trim());
}

function generatePDF(dir, jobID) {
    return new Promise(function(resolve, reject) {
        const latex = spawn(path.join(__dirname, 'buildPDF.sh'), [dir, jobID]);
        if (!jobs[dir]) jobs[dir] = {};
        jobs[dir][jobID] = latex;
        const log = [];
        latex.stdout.on('data', (data) => {
            // console.log('consoleOut', data.toString());
            log.push(data);
        });

        latex.stderr.on('data', (data) => {
            // console.log('consoleErr', data);
            log.push(data);
        });

        latex.on('exit', (code) => {
            delete jobs[dir][jobID];
            if (!nodeFS.existsSync(path.join(dir, jobID + '.pdf'))) {
                reject(code);
            } else {
                resolve(log);
            }
        });
    });
}

function parseTex(texString, dir, fileID) {
    if (jobs[dir] && Object.keys(jobs[dir]).length > 0) {
        for (let jobID in jobs[dir]) {
            if (jobs[dir].hasOwnProperty(jobID)) jobs[dir][jobID].kill();
        }
    }

    const start = new Date();

    return new Promise(function(resolve, reject) {
        const jobID = fileID;//uuidV4();
        const indexOfDocument = texString.indexOf("\\begin{document}");
        const tex = texString.substr(0, indexOfDocument) + PROGRESS_INJECTION + texString.substr(indexOfDocument);
        fs.writeFile(path.join(dir, `${jobID}.tex`), tex).then(
            generatePDF(dir, jobID).then((log) => {
                // TODO Send log and linting data to client
                fs.readFile(path.join(dir, `${jobID}.pdf`)).then((pdf) => {
                    fs.readFile(path.join(dir, `${jobID}.lint`)).then((lint) => {
                        console.log('processed request for', dir, jobID, new Date() - start);
                        resolve([log, lint, pdf]);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject)
        ).catch(reject);
    });
}

// const serverDir = createTempDir();

// WebSocket server
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    const userDir = createTempDir();

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            const data = JSON.parse(message.utf8Data);

            switch (data.type) {
                case 'texSource':
                    userDir.then((dir) => {
                        parseTex(data.tex, dir, data.fileID).then(([log, lint, pdf]) => {
                            connection.send(pdf, {binary: true});
                        }).catch((err) => {
                            // Job got cancelled for some reason
                            // Either a newer job for the same user got executed
                            // or something bad happened (TODO which should be handled)
                        });
                    });
                    break;
                default:
                    console.log('unknown request', data);
                    break;
            }
        }
    });

    connection.on('close', function(connection) {
        userDir.then((dir) => {
            if (dir.startsWith('/tmp')) {
                rimraf(dir, function () {
                    console.log('cleaned up directory', dir);
                });
            }
        })
    });
});


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