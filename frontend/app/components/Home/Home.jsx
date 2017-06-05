import React from 'react';
import { connect } from 'react-redux';
import { AppBar } from 'material-ui';
import { Sticky, StickyContainer } from 'react-sticky';
import FilePicker from '../FilePicker/FilePicker';
import { createFile } from '../../redux/actions/navigation.js';

import './Home.css';

class Home extends React.Component {

    createAndOpenFile = () => {
        this.props.dispatch(createFile(this.props.googleAPI.get('api').drive));
    }

    render() {
        return (<StickyContainer style={{ backgroundColor: '#eee' }}>
            <Sticky>
                <AppBar
                    title="TexDocs"
                    style={{ backgroundColor: '#FF5722' }}
                />
            </Sticky>
            <div className="content">
                <div className="template-picker">
                    <button onClick={this.createAndOpenFile}>Click to create new document</button>
                </div>
                <div className="picker-container">
                    <FilePicker />
                </div>
            </div>
        </StickyContainer>);
    }
}

Home.propTypes = {
    googleAPI: React.PropTypes.object.isRequired
};

export default connect(
(state) => { return { googleAPI: state.googleAPI }; }
)(Home);
