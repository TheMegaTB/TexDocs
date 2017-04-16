export const COMMAND = /(\\[a-zA-Z0-9]+)(\[?)([a-zA-Z0-9]*)(])?({?)([a-zA-Z0-9]*)(}?)$/;

export function getCommand(editor) {
    const selStart = editor.getSelectionRange().start;
    const line = editor.session.getLine(selStart.row);
    const prefix = line.substr(0, selStart.column);
    const matches = prefix.match(COMMAND);
    return matches
        ? {
            cmd: matches[1],
            mods: matches[3],
            args: matches[6],
            match: matches[0]
        }
        : null;
}
