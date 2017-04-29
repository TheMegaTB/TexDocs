import React, {Component, PropTypes} from 'react';
import TextField from 'material-ui/TextField';

export default class EditorMenubarTitle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.title,
        };
    }

    handleChange = (event) => {
        this.setState({
            value: event.target.value,
        });
    };

    render() {
        return (
            <div>
                <TextField
                    id="text-field-controlled"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
