import {API_KEY, DRIVE_MIME_TYPE} from "../const";

export function searchDrive(driveAPI, searchString, fields) {
    return new Promise((resolve, reject) => {
        driveAPI.files.list({
            key: API_KEY,
            q: searchString,
            fields: fields
        }).execute((res) => {
            if (!res.files) reject(res);
            resolve(res.files);
        });
    });
}

export async function fetchFile(driveAPI, id) {
    const res = await driveAPI.files.get({
        key: API_KEY,
        fileId: id,
        alt: 'media',
    });

    return res.body;
}

export async function createFile(driveAPI, name) {
    const res = await driveAPI.files.create({
        fields: 'appProperties,name,mimeType,id',
        name: name,
        mimeType: DRIVE_MIME_TYPE,
        appProperties: {
            latex: true
        }
    });

    if (!res.result.id) throw "Error creating file";
    return res.result.id;
}

function readBinaryBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsBinaryString(blob);
    });
}

export async function uploadPDF(client, fileId, pdfBlob) {
    const base64Data = btoa(await readBinaryBlob(pdfBlob));

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    // Updating the metadata is optional and you can instead use the value from drive.files.get.
    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify({}) +
        delimiter +
        'Content-Type: ' + DRIVE_MIME_TYPE + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    const request = client.request({
        'path': '/upload/drive/v3/files/' + fileId,
        'method': 'PATCH',
        'params': {
            'uploadType': 'multipart',
            'alt': 'json',
            'ocr': true
        },
        'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    request.execute();
}

let shareClient = undefined;

export function shareFile(shareAPI, accessToken, id) {
    if (!shareClient) shareClient = new shareAPI.ShareClient();
    shareClient.setItemIds([id]);
    shareClient.setOAuthToken(accessToken);
    shareClient.showSettingsDialog();
}
