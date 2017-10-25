const path = require('path');
const fs = require('mz/fs');
const nodeFS = require('fs');
const spawn = require('child_process').spawn;
const google = require('./google');
const getFileByPrefix = require("./helpers.js").getFileByPrefix;

const PROGRESS_INJECTION = `
\\usepackage{everyshi}
\\EveryShipout{\\message{^^JHELLO \\thepage^^J}}
`;

const jobs = {};

function generatePDF(dir, jobID) {
    return new Promise(function(resolve, reject) {
        const latex = spawn(path.join(__dirname, 'buildPDF.sh'), [dir, jobID]);
        if (!jobs[dir]) jobs[dir] = {};
        jobs[dir][jobID] = latex;
        const log = {
            "out": [],
            "err": []
        };
        latex.stdout.on('data', (data) => {
            log.out.push(data.toString());
        });

        latex.stderr.on('data', (data) => {
            // console.log('consoleErr');
            log.err.push(data.toString());
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

    const indexOfDocument = texString.indexOf("\\begin{document}");
    const tex = texString.substr(0, indexOfDocument) + PROGRESS_INJECTION + texString.substr(indexOfDocument);

    await fs.writeFile(path.join(dir, `${fileID}.tex`), tex);

    const log = await generatePDF(dir, fileID);
    const pdf = await fs.readFile(path.join(dir, `${fileID}.pdf`));
    const lint = await fs.readFile(path.join(dir, `${fileID}.lint`));

    console.log('processed request for', dir, fileID, new Date() - start);
    return [log, lint.toString(), pdf];
}

async function fetchTexDependencies(tex, user) {
    const tmpDir = await user.dir;

    // Google drive files
    const driveFiles = getFileByPrefix(tex, 'GDrive').map(driveFile =>
        google.syncDriveFile(driveFile.id, path.join(tmpDir, driveFile.name), user.auth)
    );

    const drivePromise =  Promise.all(driveFiles).then(undefined, (err) => {
        console.error("Error retrieving some GDrive files: ", err);
    });

    // Files by URL
    const webFiles = getFileByPrefix(tex, 'WWW').map(url => {

    });

    const webPromise = Promise.all(webFiles).then(undefined, (err) => {
        console.error("Error retrieving some Web files: ", err);
    });

    return Promise.all([drivePromise, webPromise]);
}

module.exports = {
    parse: parseTex,
    fetchTexDependencies: fetchTexDependencies
};