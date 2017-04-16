import {getCommand} from "../regex";
import Fuse from '../../../../api/fuse.min';
import {search, searchOptions} from './search';
import {getCompletionByCommand} from "./generic";

const commands = {
    env: [
        "begin"
    ],
    char: [
        " ",
        "!",
        "\"",
        "#",
        "$",
        "%",
        "&",
        "’",
        "‘",
        "-",
        ".",
        "=",
        "^",
        "_",
        "{",
        "}",
        "~",
        "aa",
        "AA",
        "acute"
    ],
    math: [
        "(",
        ")",
        "*",
        "[",
        "]",
        "|",

    ],
    text: [
        "+",
        ",",
        "/",
        ":",
        ";",
        "<",
        ">",
        "@",
        "\\",
        "\\*",
        "a‘",
        "a=",
    ]
};

const cmdFuses = [];

for (let category in commands) {
    cmdFuses.push({
        name: category,
        fuse: new Fuse(commands[category], searchOptions)
    });
}

export const commandCompleter = {
    identifierRegexps: [/[\\a-zA-Z0-9{}\[\]]/],
    getCompletions: function(editor, session, pos, prefix, callback) {
        const command = getCommand(editor);
        if (!command) { callback(null, []); return }
        const completions = [];

        search(cmdFuses, commands, command.cmd.substr(1)).forEach((suggestion) => {
            const cmd = Object.assign({ meta: 'cmd:' + suggestion.category }, command);
            cmd.cmd = `\\${suggestion.match}`;
            completions.push(getCompletionByCommand(cmd));
        });

        callback(null, completions);
    }
};
