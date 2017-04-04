import React from "react";
import {createDocument} from "../../api/google";

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const create = () => {
            createDocument("SomeTexDoc", (id) => {
                this.props.history.push('/document/' + id);
            });
        };
        return <div>
            This is the home!
            <button onClick={create}>Create file</button>
        </div>;
    }
}
