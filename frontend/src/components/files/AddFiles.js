import Dropzone from 'react-dropzone'
import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {addFiles, getFiles} from "../../actions/files";
import "./index.css"

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
            <div>
                <Dropzone onDrop={this.handleDrop} style={{width: '50%', height: '50px'}}>
                    {({getRootProps, getInputProps}) => (
                        <section className="container">
                            <div {...getRootProps({className: 'dropzone'})}>
                                <input {...getInputProps()} />
                                <h4 className={"dropezone"}>Drag 'n' drop some files here, or click to select files</h4>
                            </div>
                        </section>
                    )}
                </Dropzone>
            </div>
        );
    }
}

export default connect(null, {addFiles, getFiles})(AddFiles);