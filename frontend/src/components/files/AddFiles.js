import Dropzone from 'react-dropzone'
import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {addFiles, getFiles} from "../../actions/files";

class AddFiles extends Component {
    static propTypes = {
        addFiles: PropTypes.func.isRequired,
        getFiles: PropTypes.func.isRequired
    };
    state = {
        files: []
    };


    handleDrop = (files) => {
        this.setState({files});
        this.props.addFiles(files);
        this.props.getFiles();
    };

    render() {
        return (

            <Dropzone onDrop={this.handleDrop}>
                {({getRootProps, getInputProps}) => (
                    <section className="container">
                        <div {...getRootProps({className: 'dropzone'})}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                )}
            </Dropzone>
        );
    }
}

export default connect(null, {addFiles, getFiles})(AddFiles);