import React from 'react';

require('./App.css');

import ContentEditable from "react-contenteditable";

const MyComponent = React.createClass({
    getInitialState: function(){
        return {text: require("raw-loader!./latex")};
    },

    handleChange: function(evt){
        const content = evt.target.value.replace(/<\/?span[^>]*>/gi, '');
        // this.setState({text: content});
        console.log(content);
        // console.log(evt.target.value);
        // this.setState({html: evt.target.value});
    },

    render: function() {
        const highlightedCode = Prism.highlight(this.state.text, Prism.languages.latex);
        const tokenized = Prism.tokenize(this.state.text, Prism.languages.latex);
        return <pre><ContentEditable
            html={highlightedCode} // innerHTML of the editable div
            disabled={false}       // use true to disable edition
            onChange={this.handleChange} // handle innerHTML change
        /></pre>
    }
});

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <MyComponent/>;
        // return (
        //     <div>
        //         <h1>Hello World</h1>
        //         <pre>
        //             <code className="language-latex" contentEditable={true}>
        //                 {require("raw-loader!./latex")}
        //             </code>
        //         </pre>
        //     </div>
        // );
    }
}
