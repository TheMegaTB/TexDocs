export const COMMAND = /\\([a-zA-Z0-9]*)(\[?)([a-zA-Z0-9]*)(])?({?)([a-zA-Z0-9]*)(}?)/g;

const Command = function(cmd, modOpened, mod, modClosed, argOpened, arg, argClosed, cursor, location) {
    this.cmd = {
        value: cmd,
        suggestable: cursor >= (`\\${cmd}`).length
    };

    let modPrefix = `\\${cmd}`;
    if (modOpened) modPrefix += `[${mod}`;
    this.mod = {
        value: mod,
        opened: modOpened,
        closed: modClosed === ']',
        suggestable: cursor >= modPrefix.length
    };

    let argPrefix = `\\${cmd}`;
    if (modOpened) argPrefix += `[${mod}`;
    if (this.mod.closed) argPrefix += `]`;
    if (argOpened) argPrefix += `{${arg}`;
    this.arg = {
        value: arg,
        opened: argOpened,
        closed: argClosed === '}',
        suggestable: cursor >= argPrefix.length
    };

    this.location = location;
    this.cursor = cursor;

    this.clone = () => {
        return new Command(
            this.cmd.value,
            this.mod.opened, this.mod.value, this.mod.closed,
            this.arg.opened, this.arg.value, this.arg.closed,
            this.cursor,
            this.location
        )
    };

    this.buildCommand = (upTo) => {
        let cmd = `\\${this.cmd.value}`;

        if (upTo === 'cmd') return cmd;

        if (this.mod.value) cmd += `[${this.mod.value}`;
        else if (this.mod.opened) cmd += '[';
        if (this.mod.opened) cmd += ']';

        if (upTo === 'mod') return cmd;

        if (this.arg.value) cmd += `{${this.arg.value}`;
        else if (this.arg.opened) cmd += '{';
        if (this.arg.opened) cmd += '}';

        return cmd;
    };

    this.getSuggestion = (suggestions, meta) => {
        const newCmd = this.clone();

        suggestions.forEach((suggestion) => {
            if (!this[suggestion.type].suggestable) return null;
            switch (suggestion.type) {
                case 'cmd':
                    newCmd.cmd.value = suggestion.value;
                    break;
                case 'mod':
                    newCmd.mod.opened = true;
                    newCmd.mod.value = suggestion.value;
                    break;
                case 'arg':
                    newCmd.arg.opened = true;
                    newCmd.arg.value = suggestion.value;
                    break;
                default:
                    throw "[CMD] No suggestion type passed!";
                    return null;
            }
        });

        const postfix = this.buildCommand().substr(this.cursor);
        const command = newCmd.buildCommand();

        const caption = command.replace(/\${\d}/g, '...'); // Replace ${1}'s w/ ...
        const snippet = command.replace(postfix, ''); // Remove everything after the cursor

        return {
            snippet: snippet,
            caption: caption,
            meta: meta
        }
    }
};

export function getCommand(editor) {
    const selStart = editor.getSelectionRange().start;
    const line = editor.session.getLine(selStart.row);

    const commands = [];
    let getKeyValue = (match, cmd, modOpened, mod, modClosed, argOpened, arg, argClosed) => {
        const index = line.indexOf(match); // TODO This does not work for duplicates
        commands.push(new Command(
            cmd,
            modOpened, mod, modClosed,
            argOpened, arg, argClosed,
            selStart.column - index,
            [index, index + match.length]
        ));
    };
    line.replace(COMMAND, getKeyValue);

    for (let command in commands) {
        const location = commands[command].location;
        if (location[0] <= selStart.column && location[1] >= selStart.column) {
            return commands[command];
        }
    }

    return null;
}
