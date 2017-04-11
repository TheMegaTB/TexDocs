import React, {Component} from 'react';
import {DOC_CONTENT_ID} from "../../../const";

import './EditorContent.css';
import * as Prism from "prismjs";
import "prismjs/components/prism-latex.min.js";

function tokenToElement(token, id) {
    if (typeof token === 'string') return token;
    if (token.content instanceof Array) return token.content.map(tokenToElement);
    return React.createElement(
        "span",
        {key: id, className: 'prism-token token ' + token.type},
        token.content
    );
}

function getCaretCharacterWithin(element) {
    let caret = {
        start: 0,
        end: 0
    };
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection !== "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            const range = win.getSelection().getRangeAt(0);

            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caret.end = preCaretRange.toString().length;

            const postCaretRange = range.cloneRange();
            postCaretRange.selectNodeContents(element);
            postCaretRange.setEnd(range.startContainer, range.startOffset);
            caret.start = postCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type !== "Control") {
        const textRange = sel.createRange();
        const preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caret.start = preCaretTextRange.text.length;
        caret.end = preCaretTextRange.text.length;
    }
    return caret;
}

function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange();
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (let lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    }

    return range;
}

function isCharacterKeyPress(e) {
    const keycode = e.which || e.keyCode;
    return ((keycode > 47 && keycode < 58)   || // number keys
            keycode === 32 || keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
            (keycode > 64 && keycode < 91)   || // letter keys
            (keycode > 95 && keycode < 112)  || // numpad keys
            (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
            (keycode > 218 && keycode < 223))&& // [\]' (in order)
            !e.ctrlKey && !e.metaKey && !e.altKey;
}

function isSelectionMovement(keyCode) {
    return keyCode > 32 && keyCode < 41;
}

function eq(a, b) {
    return a === b;
}

export default class EditorContentNew extends Component {
    constructor(args) {
        super(args);

        this.state = {
            collabString: undefined,
            content: "",
            cursor: {
                start: 0,
                end: 0
            }
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.updateCursor = this.updateCursor.bind(this);
        this.setCursor = this.setCursor.bind(this);
        this.onExternalChange = this.onExternalChange.bind(this);
    }

    componentDidMount() {
        const document = this.props.document;
        const collabString = document.getModel().getRoot().get(DOC_CONTENT_ID);

        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_INSERTED, this.onExternalChange);
        collabString.addEventListener(window.gapi.drive.realtime.EventType.TEXT_DELETED, this.onExternalChange);

        this.setState({
            collabString: collabString,
            content: collabString.toString()
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!eq(prevState.content, this.state.content)) {
            this.state.collabString.setText(this.state.content);
            // this.editorWrapper.innerHTML = Prism.highlight(this.state.content, Prism.languages.latex);
            this.setCursor();
        } else if (!eq(prevState.cursor, this.state.cursor)) {
            this.setCursor();
        }
    }

    onExternalChange(e) {
        if (e.isLocal) return;

        if (e.index > this.state.cursor.end) {
            this.setState({
                content: e.target.toString()
            });
        } else if (e.type === gapi.drive.realtime.EventType.TEXT_INSERTED) {
            this.setState({
                content: e.target.toString(),
                cursor: {
                    start: this.state.cursor.start + e.text.length,
                    end: this.state.cursor.end + e.text.length
                }
            });
        } else if (e.type === gapi.drive.realtime.EventType.TEXT_DELETED) {
            if (e.index === this.state.cursor.end - 1) {
                const end = this.state.cursor.end - e.text.length;
                this.setState({
                    content: e.target.toString(),
                    cursor: {
                        start: end <= this.state.cursor.start ? end : this.state.cursor.start,
                        end: end
                    }
                });
            } else
                this.setState({
                    content: e.target.toString(),
                    cursor: {
                        start: this.state.cursor.start - e.text.length,
                        end: this.state.cursor.end - e.text.length
                    }
                });
        }
    }

    updateCursor() {
        const newCursor = getCaretCharacterWithin(this.editorWrapper);
        this.setState({
            cursor: newCursor
        });
    }

    setCursor() {
        const selection = window.getSelection();
        const cursor = this.state.cursor;
        const multiChar = cursor.start !== cursor.end;

        let range;
        if (multiChar) {
            const startRange = createRange(this.editorWrapper, { count: this.state.cursor.start });
            range = createRange(this.editorWrapper, { count: this.state.cursor.end });
            range.setStart(startRange.endContainer, startRange.endOffset);
        } else
            range = createRange(this.editorWrapper, { count: this.state.cursor.start });

        if (range) {
            if (!multiChar) range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    onKeyDown(e) {
        if (!isSelectionMovement(e.which))
            e.preventDefault();

        const keyCode = e.which || e.keyCode;

        const cursor = this.state.cursor;
        const content = this.state.content;
        let newContent = content;
        let newCursor = cursor.start;

        if (isCharacterKeyPress(e)) {
            const key = keyCode === 13 ? '\n' : e.key;
            newContent = content.substr(0, cursor.start) + key + content.substr(cursor.end);
            newCursor += key.length;
        } else if (keyCode === 8) {
            const start = cursor.start === cursor.end ? cursor.start - 1 : cursor.start;
            newContent = content.substr(0, start) + content.substr(cursor.end);
            newCursor = start;
        } else if (keyCode === 46) {
            const end = cursor.start === cursor.end ? cursor.end + 1 : cursor.end;
            newContent = content.substr(0, cursor.start) + content.substr(end);
        }

        this.setState({
            content: newContent,
            cursor: {
                start: newCursor,
                end: newCursor
            }
        });
    }

    onKeyUp(e) {
        if (!isSelectionMovement(e.which))
            e.preventDefault(); // TODO Cursor movement when area selected == weird (should start at either end and not prev. position)
        else
            this.updateCursor();
    }

    render() {
        const children = Prism.tokenize(this.state.content, Prism.languages.latex).map(tokenToElement);
        console.log(children);
        const editorWrapper = <div
                className="editor-content"
                contentEditable={true}
                suppressContentEditableWarning={true}
                role="textbox"
                spellCheck={false}
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}
                onMouseUp={this.updateCursor}
                onFocus={this.updateCursor}
                ref={(editorWrapper) => {
                    this.editorWrapper = editorWrapper
                }}
        >{children}</div>;

        return (
            editorWrapper
        );
    }
}
