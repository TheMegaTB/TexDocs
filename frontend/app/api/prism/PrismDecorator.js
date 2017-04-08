import * as Immutable from "immutable";
import * as Prism from "prismjs";

import PrismOptions from "./PrismDecoratorOptions";

const KEY_SEPARATOR = '-';

function PrismDecorator(options, carets) {
    this.options = PrismOptions(options || {});
    this.highlighted = {};
    this.carets = carets;
}

/**
 * Return list of decoration IDs per character
 *
 * @return {List<String>}
 * @param block
 */
PrismDecorator.prototype.getDecorations = function(block) {
    let tokens, token, offset = 0;
    const filter = this.options.get('filter');
    const getSyntax = this.options.get('getSyntax');
    const blockKey = block.getKey();
    const blockText = block.getText();
    const decorations = new Array(blockText.length).fill(null);

    this.highlighted[blockKey] = {};

    if (!filter(block)) {
        return Immutable.List(decorations);
    }

    const syntax = getSyntax(block) || this.options.get('defaultSyntax');

    // Allow for no syntax highlighting
    if (syntax === null) {
        return Immutable.List(decorations);
    }

    const carets = this.carets.hasOwnProperty(blockKey) ? this.carets[blockKey] : {};

    // Parse text using Prism
    const grammar = Prism.languages[syntax];
    tokens = Prism.tokenize(blockText, grammar);

    const caretPositions = Object.keys(carets);
    const tokenParts = [];

    let lastCaret = 0;
    caretPositions.forEach((caretPos) => {
        caretPos = parseInt(caretPos);
        lastCaret = caretPos;
        tokenParts.push([lastCaret, caretPos, carets[caretPos]]);
    });

    if (lastCaret === 0) tokenParts.push([0, blockText.length]);

    const splitToken = (start, end, token, caret = false, caretAttributes) => {
        const storeToken = (tokenId) => {
            if (caret) {
                const newToken = Object.assign({}, token);
                newToken.caret = caretAttributes;
                this.highlighted[blockKey][tokenId] = newToken;
            } else
                this.highlighted[blockKey][tokenId] = token;
        };

        for (let part in tokenParts) {
            if (!tokenParts.hasOwnProperty(part)) continue;
            part = tokenParts[part];

            const splitLoc = part[1];
            const tokenId = 'tok' + start;
            const resultId = blockKey + KEY_SEPARATOR + tokenId;

            if (part[0] > start && part[0] < end) {
                storeToken(tokenId);
                occupySlice(decorations, start, splitLoc, resultId);
                splitToken(splitLoc, end, token, true, part[2]);
                return;
            } else if (start === part[0]) {
                caret = true;
                caretAttributes = part[2];
                storeToken(tokenId);
                occupySlice(decorations, start, splitLoc, resultId);
            }
        }

        const tokenId = 'tok' + start;
        const resultId = blockKey + KEY_SEPARATOR + tokenId;
        storeToken(tokenId);
        occupySlice(decorations, start, end, resultId);
    };

    for (let i = 0; i < tokens.length; i++) {
        token = tokens[i];

        if (typeof token === 'string')
            token = {
                content: token,
                type: ''
            };

        splitToken(offset, offset + token.content.length, token);

        offset += token.content.length;
    }

    tokenParts.forEach((caret) => {
        if (caret[0] === offset) {
            const tokens = Object.keys(this.highlighted[blockKey]);
            const tokenId = tokens[tokens.length - 1];
            const token = this.highlighted[blockKey][tokenId];

            const newToken = Object.assign({}, token);
            newToken.caret = caret[2];
            newToken.caret.end = true;
            this.highlighted[blockKey][tokenId] = newToken;
        }
    });

    return Immutable.List(decorations);
};

/**
 * Return component to render a decoration
 *
 * @return {Function}
 * @param key
 */
PrismDecorator.prototype.getComponentForKey = function(key) {
    return this.options.get('render');
};

/**
 * Return props to render a decoration
 *
 * @return {Object}
 * @param key
 */
PrismDecorator.prototype.getPropsForKey = function(key) {
    const parts = key.split('-');
    const blockKey = parts[0];
    const tokId = parts[1];
    const token = this.highlighted[blockKey][tokId];

    return {
        type: token.type,
        caret: token.caret
    };
};

function occupySlice(targetArr, start, end, componentKey) {
    for (let ii = start; ii < end; ii++) {
        targetArr[ii] = componentKey;
    }
}

module.exports = PrismDecorator;
