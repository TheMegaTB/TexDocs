
const exec = require('mz/child_process').exec;

module.exports = {
    getFileByPrefix: function(tex, prefix) {
        const regEx = new RegExp(`${prefix}:[^(}| |\n)]+`,"g");
        let match, matches = [];

        while ((match = regEx.exec(tex)) !== null) {
            matches.push({
                name: match[0],
                id: match[0].replace(`${prefix}:`, '')
            });
        }

        return matches;
    },
    createTempDir: function() {
        return exec('mktemp -d').then((res) => res[0].trim());
    }
};