import * as Immutable from 'immutable';
import * as Prism from 'prismjs';

import PrismOptions from './PrismDecoratorOptions';

var KEY_SEPARATOR = '-';

function PrismDecorator(options) {
    this.options = PrismOptions(options || {});
    this.highlighted = {};
}

/**
 * Return list of decoration IDs per character
 *
 * @param {ContentBlock}
 * @return {List<String>}
 */
PrismDecorator.prototype.getDecorations = function(block) {
    let tokens, token, tokenId, resultId, offset = 0;
    const filter = this.options.get('filter');
    const getSyntax = this.options.get('getSyntax');
    const blockKey = block.getKey();
    const blockText = block.getText();
    const decorations = Array(blockText.length).fill(null);

    this.highlighted[blockKey] = {};

    if (!filter(block)) {
        return Immutable.List(decorations);
    }

    const syntax = getSyntax(block) || this.options.get('defaultSyntax');

    // Allow for no syntax highlighting
    if (syntax === null) {
        return Immutable.List(decorations);
    }

    // Parse text using Prism
    const grammar = Prism.languages[syntax];
    tokens = Prism.tokenize(blockText, grammar);

    for (let i = 0; i < tokens.length; i++) {
        token = tokens[i];

        if (typeof token === 'string') {
            offset += token.length;
        } else {
            tokenId = 'tok'+offset;
            resultId = blockKey + '-' + tokenId;

            this.highlighted[blockKey][tokenId] = token;

            occupySlice(decorations, offset, offset + token.content.length, resultId);
            offset += token.content.length;
        }
    }

    console.log(this.highlighted);
    console.log(decorations);

    return Immutable.List(decorations);
};

/**
 * Return component to render a decoration
 *
 * @param {String}
 * @return {Function}
 */
PrismDecorator.prototype.getComponentForKey = function(key) {
    return this.options.get('render');
};

/**
 * Return props to render a decoration
 *
 * @param {String}
 * @return {Object}
 */
PrismDecorator.prototype.getPropsForKey = function(key) {
    var parts = key.split('-');
    var blockKey = parts[0];
    var tokId = parts[1];
    var token = this.highlighted[blockKey][tokId];

    return {
        type: token.type
    };
};

function occupySlice(targetArr, start, end, componentKey) {
    for (var ii = start; ii < end; ii++) {
        targetArr[ii] = componentKey;
    }
}

module.exports = PrismDecorator;
