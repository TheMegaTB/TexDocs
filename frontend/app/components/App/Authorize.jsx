import React, {Component} from 'react'
import {RaisedButton} from "material-ui";

export default class Authorize extends Component {
    render() {
        return (
            <div style={{width: '20%', margin: 'auto', textAlign: 'center'}}>
                <h1 style={{color: 'black'}}>TexDocs</h1>
                <RaisedButton label="Login with Google" primary={true} onTouchTap={this.props.onAuthClick}/>
            </div>
        );
    }
}
