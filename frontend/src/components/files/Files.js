import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {deleteFiles, getFiles} from "../../actions/files";


class Files extends Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        deleteFiles: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.getFiles();
    }

    render() {
        return (
            <div>
                <h1>Files:</h1>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.files.map(file => (
                        <tr key={file}>
                            <td>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    files: state.files.files
});

export default connect(mapStateToProps, {getFiles, deleteFiles})(Files);