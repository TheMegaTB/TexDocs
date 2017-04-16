import {getCommand} from "../regex";

export function getCompletionByCommand(command) {
    const envCmd = command.cmd === '\\begin';

    let caption = command.cmd;
    if (command.mods.length > 0) caption += `[${command.mods}]`;
    if (command.args.length > 0) caption += `{${command.args}}`;
    else if (command.args.length === 0 && envCmd) caption += '{...}';

    let snippet = command.cmd;
    if (command.mods.length > 0) snippet += `[${command.mods}]`;
    if (command.args.length > 0) snippet += `{${command.args}}`;
    else if (command.args.length === 0 && envCmd) snippet += '{${1}}';

    if (envCmd) {
        snippet += '\n\t${' + (command.args ? 1 : 2) + '}';
        snippet += `\n\\end{${ command.args ? command.args : '${1}'}}`
    }

    const meta = envCmd ? 'env' : 'cmd';

    return {
        caption: caption,
        snippet: snippet,
        meta: command.meta ? command.meta : meta
    };
}

export const genericCompleter = {
    identifierRegexps: [/[\\a-zA-Z0-9{}\[\]]/],
    getCompletions: function(editor, session, pos, prefix, callback) {
        const command = getCommand(editor);
        if (!command) { callback(null, []); return }

        callback(null, [getCompletionByCommand(command)]);
    }
};
