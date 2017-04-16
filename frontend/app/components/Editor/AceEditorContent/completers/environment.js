import {getCommand} from "../regex";
import Fuse from '../../../../api/fuse.min';
import {search, searchOptions} from './search';
import {getCompletionByCommand} from "./generic";

const environments = {
    table: [
        "figure",
        "table",
        // Helpers
        "tabbing",
        "tabular"
    ],
    enum: [
        "description",
        "enumerate",
        "itemize"
    ],
    math: [
        "math",
        "displaymath",
        "array",
        "eqnarray",
        "equation",
        "theorem",
        // Helpers
        "subequations",
        "split",
        "multiline",
        "gather",
        "align",
        "flalign"
    ],
    matrix: [
        "matrix",
        "pmatrix",
        "bmatrix",
        "Bmatrix",
        "vmatrix",
        "Vmatrix",
        "smallmatrix",
        "cases",
        "alignat",
    ],
    para: [
        "center",
        "flushleft",
        "flushright",
        "minipage",
        "quotation",
        "quote",
        "verbatim",
        "verse",
    ],
    other: [
        "picture",
        "thebibliography",
        "titlepage",
        "document"
    ]
};

const envFuses = [];

for (let env in environments) {
    envFuses.push({
        name: env,
        fuse: new Fuse(environments[env], searchOptions)
    });
}

export const environmentCompleter = {
    identifierRegexps: [/[\\a-zA-Z0-9{}\[\]]/],
    getCompletions: function(editor, session, pos, prefix, callback) {
        const command = getCommand(editor);
        if (!command || (command && command.cmd !== '\\begin')) { callback(null, []); return }
        const completions = [];

        search(envFuses, environments, command.args).forEach((suggestion) => {
            const cmd = Object.assign({ meta: 'env:' + suggestion.category }, command);
            cmd.args = suggestion.match;
            completions.push(getCompletionByCommand(cmd));
        });

        callback(null, completions);
    }
};
