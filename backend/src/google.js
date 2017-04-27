const fs = require('mz/fs');
const md5 = require('md5');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const credentials = require('./credentials.json');

function createOAuthInstance(token) {
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(credentials.clientID, credentials.clientSecret, '');
    oauth2Client.credentials = { access_token: token };
    return oauth2Client;
}

function downloadDriveFile(id, driveAPI, auth) {
    return new Promise((resolve, reject) => {
        driveAPI.files.get({
            key: credentials.apiKey,
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

function getDriveFileHash(id, driveAPI, auth) {
    return new Promise((resolve, reject) => {
        driveAPI.files.get({
            key: credentials.apiKey,
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

function updateFile(id, oauth2Client, blob) {
    const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });

    const media = {
        mimeType: 'application/pdf',
        body: blob
    };
    driveAPI.files.update({
        fileId: id,
        resource: {},
        media: media,
        fields: 'id',
        auth: oauth2Client,
        key: credentials.apiKey
    }, function(err, file) {
        if(err) console.log('The API returned an error: ' + err);
    });
}

module.exports = {
    createOAuthInstance:createOAuthInstance,
    syncDriveFile: syncDriveFile,
    updateFile: updateFile
};