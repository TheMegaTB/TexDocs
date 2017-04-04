import React from "react";
import RaisedButton from 'material-ui/RaisedButton';
import Drive from 'material-ui/svg-icons/notification/folder-special';

export default class Authentication extends React.Component {
    render() {
        return (
            <div id="wrapper" style={{textAlign: 'center'}}>
                <div id="yourdiv" style={{display: 'inline-block'}}>
                    <RaisedButton
                        label="Authenticate"
                        primary={true}
                        style={{margin: 12}}
                        onClick={this.props.callback}
                        icon={<Drive/>}
                    />
                </div>
            </div>
        );
    }
}
