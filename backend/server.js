const WebSocketServer = require('websocket').server;
const http = require('http');
const express = require('express');
const path = require('path');
const nodeFS = require('fs');
const fs = require('mz/fs');
const exec = require('mz/child_process').exec;
const rimraf = require('rimraf');
const spawn = require('child_process').spawn;
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const md5 = require('md5');

const credentials = require('./credentials.json');

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

async function parseTex(texString, dir, fileID) {
    if (jobs[dir] && Object.keys(jobs[dir]).length > 0) {
        for (let jobID in jobs[dir]) {
            if (jobs[dir].hasOwnProperty(jobID)) jobs[dir][jobID].kill();
        }
    }

    const start = new Date();

    const jobID = fileID;//uuidV4();
    const indexOfDocument = texString.indexOf("\\begin{document}");
    const tex = texString.substr(0, indexOfDocument) + PROGRESS_INJECTION + texString.substr(indexOfDocument);

    await fs.writeFile(path.join(dir, `${jobID}.tex`), tex);

    const log = await generatePDF(dir, jobID);
    const pdf = await fs.readFile(path.join(dir, `${jobID}.pdf`));
    const lint = await fs.readFile(path.join(dir, `${jobID}.lint`));

    console.log('processed request for', dir, jobID, new Date() - start);
    return [log, lint, pdf];
}

function getDriveFilesFromTex(tex) {
    const regEx = /GDrive:[a-zA-Z0-9]+/g;
    let match, matches = [];

    while ((match = regEx.exec(tex)) !== null) {
        matches.push({
            name: match[0],
            id: match[0].replace('GDrive:', '')
        });
    }

    return matches;
}

function createOAuthInstance(token) {
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(credentials.clientID, credentials.clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
    oauth2Client.credentials = token;
    console.log(credentials.clientID, credentials.clientSecret, oauth2Client);
    return oauth2Client;
}

function downloadDriveFile(id, driveAPI, auth) {
    return new Promise((resolve, reject) => {
        console.log('downloading file');
        driveAPI.files.get({
            auth: auth,
            fileId: id,
            alt: 'media'
        }, {
            encoding: null // Make sure we get the binary data
        }, function (err, buffer) {
            if (err) reject(err);
            resolve(buffer);
        });
    });
}

function getDriveFileHash(id, driveAPI) {
    return new Promise((resolve, reject) => {
        console.log('retrieving hash');
        driveAPI.files.get({
            auth: auth,
            fileId: id,
            fields: 'md5Checksum'
        }, function (err, res) {
            if (err) reject(err);
            resolve(res.md5Checksum);
        });
    });
}

function getLocalFileHash(file) {
    return fs.readFile(file).then(file => {
        return md5(file);
    });
}


async function syncDriveFile(id, targetFile, oauth2Client) {
    const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });

    const fileExists = await fs.exists(targetFile);
    const localHash = fileExists ? await getLocalFileHash(targetFile) : '';
    const remoteHash = fileExists ? await getDriveFileHash(id, driveAPI, oauth2Client) : '';

    if (!fileExists || localHash !== remoteHash) {
        const file = await downloadDriveFile(id, driveAPI, oauth2Client);
        await fs.writeFile(targetFile, file);
        return true;
    }

    return false;
}

async function handleRequest(message, connection, oAuth, userDir) {
    if (message.type === 'utf8') {
        const data = JSON.parse(message.utf8Data);

        switch (data.type) {
            case 'texSource':
                const tmpDir = await userDir;
                const driveFiles = getDriveFilesFromTex(data.tex).map(driveFile =>
                    syncDriveFile(driveFile.id, path.join(tmpDir, driveFile.name), oAuth)
                );
                Promise.all(driveFiles).then(undefined, (err) => {
                    console.error("Error retrieving some GDrive files: ", err);
                });
                parseTex(data.tex, tmpDir, data.fileID).then(([log, lint, pdf]) => {
                    connection.send(pdf, {binary: true});
                }).catch((err) => {
                    // Job got cancelled for some reason
                    // Either a newer job for the same user got executed
                    // or something bad happened (TODO which should be handled)
                });
                break;
            case 'auth':
                oAuth = createOAuthInstance(data.token);
                // const fileID = '0Bwkm3KQJFmKseHNyNE4wTXV0XzQ';
                // const localFile = '/tmp/testfile';
                // const oAuth = createOAuthInstance(data.token);
                // const sync = await syncDriveFile(fileID, localFile, oAuth);
                // console.log(sync);
                // console.log('local file is synced!');
                break;
            default:
                console.log('unknown request', data);
                break;
        }
    }
}

// WebSocket server
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    const userDir = createTempDir();
    let oAuth = undefined;

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', async function(message) {
        handleRequest(message, connection, oAuth, userDir).then(() => {}, (err) => {
            console.log(err);
        });
    });

    connection.on('close', async function(connection) {
        const tmpDir = await userDir;
        if (tmpDir.startsWith('/tmp')) {
            rimraf(tmpDir, function () {
                console.log('cleaned up directory', tmpDir);
            });
        }
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