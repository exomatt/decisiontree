import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {changeFileName, deleteFiles, getFiles} from "../../actions/files";
import {Modal} from "react-bootstrap";
import axios from "axios";


class Files extends Component {
    static propTypes = {
        token: PropTypes.string.isRequired,
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        deleteFiles: PropTypes.func.isRequired,
        changeFileName: PropTypes.func.isRequired
    };
    state = {
        isShowingModal: false,
        name: '',
        filename: ''
    };

    componentDidMount() {
        this.props.getFiles();
    }

    download(file) {
        //Get token from state
        const token = this.props.token;
        console.log(token);

        // Headers and Params
        const config =
            {
                params: {
                    'filename': file
                },
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json'

                }
            };

        // If token, add to headers config
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        axios.get("api/fileDownload",
            config)
            .then((response) => {
                console.log(response.data);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file); //or any other extension
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => console.log(error));
    }


    onChange = e => this.setState({[e.target.name]: e.target.value});
    handleShow = (file) => {
        this.setState({isShowingModal: true, filename: file});
    };

    handleClose = () => this.setState({isShowingModal: false});
    handleSubmit = () => {
        let object = {
            filename: this.state.filename,
            new_name: this.state.name
        };
        console.log(object);
        this.props.changeFileName(object);
        this.setState({
            isShowingModal: false,
            name: '',
            filename: ''
        });
        this.props.getFiles();
    };

    render() {
        const name = this.state.name;
        let xml_files = this.props.files.filter(file => file.endsWith(".xml"));
        let data_files = this.props.files.filter(function (el) {
            return xml_files.indexOf(el) < 0;
        });
        return (
            <div>
                <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                    <Modal.Header closeButton>
                        <Modal.Title>New name form</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>New file name: </Modal.Body>
                    <input type="text"
                           className="form-control"
                           name="name"
                           value={name}
                           placeholder="Enter new name"
                           onChange={this.onChange}/>
                    <Modal.Footer>
                        <button type="button"
                                className="btn btn-secondary" onClick={this.handleClose}>
                            Close
                        </button>
                        <button type="submit"
                                className="btn btn-primary" onClick={this.handleSubmit.bind()}>
                            Save Changes
                        </button>
                    </Modal.Footer>
                </Modal>
                <h1>XML Files:</h1>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {xml_files.map(file => (
                        <tr key={file}>
                            <td>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>
                            <td>
                                <button type="submit"
                                        className="btn btn-primary" onClick={(event) => this.handleShow(file)}>
                                    Change name
                                </button>
                            </td>
                            <td>
                                <button type="submit" className="btn btn-primary" onClick={() => {
                                    this.download(file)
                                }}>Download File
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <h1>Experiment files:</h1>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data_files.map(file => (
                        <tr key={file}>
                            <td>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>
                            <td>
                                <button type="submit"
                                        className="btn btn-primary" onClick={(event) => this.handleShow(file)}>
                                    Change name
                                </button>
                            </td>
                            <td>
                                <button type="submit" className="btn btn-primary" onClick={() => {
                                    this.download(file)
                                }}>Download File
                                </button>
                            </td>
                            {/*<td>*/}
                            {/*    <button type="button"*/}
                            {/*            className="btn btn-primary" onClick={(event) => {*/}
                            {/*        this.handleShow.bind();*/}
                            {/*        var text = $(this).closest("tr")   // Finds the closest row <tr>*/}
                            {/*            .siblings(":first")    // Gets a descendent with class="nr"*/}
                            {/*            .text();*/}
                            {/*        console.log(text)*/}

                            {/*    }*/}
                            {/*    }>*/}
                            {/*        Change name*/}
                            {/*    </button>*/}
                            {/*</td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    files: state.files.files,
    token: state.auth.token,
});

export default connect(mapStateToProps, {getFiles, deleteFiles, changeFileName})(Files);