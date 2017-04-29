const uuidV4 = require('uuid').v4;
const google = require('./google');
const fetchTexDependencies = require("./tex.js").fetchTexDependencies;
const createTempDir = require("./helpers.js").createTempDir;
const parseTex = require('./tex').parse;
const rimraf = require('rimraf');
const md5 = require('md5');
const diff = require('diff');

const users = {};

function patchTex(oldTex, patch, hash) {
    const tex = diff.applyPatch(oldTex || "", patch);
    if (md5(tex) !== hash && oldTex)
        return patchTex("", patch, hash);
    return tex;
}

async function handleRequest(message, userID) {
    if (message.type === 'utf8') {
        const data = JSON.parse(message.utf8Data);
        const user = users[userID];

        switch (data.type) {
            case 'texSource':
                const tmpDir = await user.dir;

                let tex;
                if (data.patch) {
                    tex = patchTex(user.tex, data.patch, data.hash);
                    if (!tex) {
                        // TODO Request the full source
                        console.error("HASH MISMATCH!!");
                        user.connection.send(JSON.stringify({
                            type: "hash_mismatch"
                        }));
                        return;
                    }
                } else {
                    tex = data.tex;
                }

                user.tex = tex;

                await fetchTexDependencies(tex, user);
                parseTex(tex, tmpDir, data.fileID).then(([log, lint, pdf]) => {
                    if (data.upload) google.updateFile(data.fileID, user.auth, pdf);
                    user.connection.send(pdf, {binary: true});
                }).catch((err) => {
                    // Job got cancelled for some reason
                    // Either a newer job for the same user got executed
                    // or something bad happened (TODO which should be handled)
                });
                break;
            case 'auth':
                user.auth = google.createOAuthInstance(data.token);
                break;
            default:
                console.log('unknown request', data);
                break;
        }
    }
}

// WebSocket server
function onConnection(request) {
    const connection = request.accept(null, request.origin);
    const userID = uuidV4();

    users[userID] = {
        dir: createTempDir(),
        auth: undefined,
        connection: connection
    };

    connection.on('message', async function(message) {
        handleRequest(message, userID).then(() => {}, (err) => {
            console.log(err);
        });
    });

    connection.on('close', async function() {
        const user = users[userID];
        const tmpDir = await user.dir;

        if (tmpDir.startsWith('/tmp')) {
            rimraf(tmpDir, function () {
                console.log('cleaned up directory', tmpDir);
            });
        }

        delete users[userID];
    });
}

module.exports = {
    onConnection: onConnection
};