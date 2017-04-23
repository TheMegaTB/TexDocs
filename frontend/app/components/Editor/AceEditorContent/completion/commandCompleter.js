import {getCommand} from "./command";
import commands from './commands.json';

export const commandCompleter = {
    identifierRegexps: [/[\\a-zA-Z0-9{}\[\]]/],
    getCompletions: function(editor, session, pos, prefix, callback) {
        const cmd = getCommand(editor);
        if (!cmd) { callback(null, []); return }
        const completions = [];

        for (let category in commands) {
            if (!commands.hasOwnProperty(category)) continue;
            for (let command in commands[category]) {
                if (!commands[category].hasOwnProperty(command)) continue;
                const currentCommand = commands[category][command];

                // Suggest the command itself
                completions.push(cmd.getSuggestion([{
                    type: 'cmd',
                    value: currentCommand.command
                }], 'cmd:' + category));

                // If it has arguments iterate them
                if (currentCommand.arguments instanceof Array)
                    currentCommand.arguments.forEach((arg) => {
                        // In case the argument is a string, suggest it
                        if (typeof arg === 'string')
                            completions.push(cmd.getSuggestion([
                                {
                                    type: 'cmd',
                                    value: currentCommand.command
                                },
                                {
                                    type: 'arg',
                                    value: arg
                                }
                            ], 'cmd:' + category));
                        else // Otherwise iterate over the possible modifiers for the argument and suggest them
                            arg.modifiers.forEach((mod) => {
                                completions.push(cmd.getSuggestion([
                                    {
                                        type: 'cmd',
                                        value: currentCommand.command
                                    },
                                    {
                                        type: 'arg',
                                        value: arg.argument
                                    },
                                    {
                                        type: 'mod',
                                        value: mod
                                    }
                                ], 'cmd:' + category));
                            })
                    });
            }
        }

        callback(null, completions);
    }
};
