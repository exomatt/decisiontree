import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {changeFileName, deleteFiles, getFiles} from "../../actions/files";
import {Modal} from "react-bootstrap";
import axios from "axios";
import {Link} from "react-router-dom";
import "./index.css"


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
        filename: '',
        interval: null
    };

    componentDidMount() {
        this.props.getFiles();
    }


    componentDidMount() {
        if (this.props.files) {
            this.props.getFiles();
        }
        if (this.state.interval)
            this.state.interval.clear();
        this.setState({interval: null});
    }

    componentDidUpdate(nextProps, nextState, nextContext) {
        if (!this.state.interval) {
            const interval = setInterval(() => {
                this.props.getFiles();
            }, 20000);
            this.setState({interval: interval})
        }

    }

    componentWillUnmount() {
        console.log("Jestem w niszczycielu experymetny");
        clearInterval(this.state.interval);
    }


    download(file) {
        //Get token from state
        const token = this.props.token;
        // console.log(token);

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
        this.setState({isShowingModal: true, filename: file, name: file});
    };

    handleClose = () => this.setState({isShowingModal: false});
    handleSubmit = () => {
        let object = {
            filename: this.state.filename,
            new_name: this.state.name
        };
        // console.log(object);
        this.props.changeFileName(object);
        this.setState({
            isShowingModal: false,
            name: '',
            filename: ''
        });
        this.props.getFiles();
        setTimeout(function () {
            this.props.getFiles();
        }.bind(this), 5000)
    };

    render() {
        const name = this.state.name;
        let xml_files = this.props.files.filter(file => file.endsWith(".xml"));
        let data_files = this.props.files.filter(el => xml_files.indexOf(el) < 0);
        xml_files.sort();
        data_files.sort();
        return (
            <div>
                <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                    <Modal.Header closeButton>
                        <Modal.Title>New name form</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>New file name:
                        <fieldset>
                            <div className="form-group">
                                <input type="text"
                                       className="form-control"
                                       name="name"
                                       value={name}
                                       placeholder="Enter new name"
                                       onChange={this.onChange}/>
                            </div>
                        </fieldset></Modal.Body>

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
                <h1>Config xml files:</h1>
                <h6>(Files with *.xml extension)</h6>
                <Link to={"/createConfigFile"} className={"btn btn-primary"}>Create Config File</Link>
                <table className="table table-striped fileTable">
                    <thead>
                    <tr>
                        <th className={"thName"}>Name</th>
                        <th colSpan={3}>Options</th>
                    </tr>
                    </thead>
                    <tbody>
                    {xml_files.map(file => (
                        <tr key={file}>
                            <td className={"thName"}>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>
                            <td>
                                <button type="submit"
                                        className="btn btn-primary" onClick={(event) => this.handleShow(file)}>
                                    Rename
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
                <h6>(Files with *.data, *.test, *.names extension)</h6>
                <table className="table table-striped fileTable">
                    <thead>
                    <tr>
                        <th className={"thName"} scope="col">Name</th>
                        <th colSpan={3}>Options</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data_files.map(file => (
                        <tr key={file}>
                            <td className={"thName"}>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>
                            <td>
                                <button type="submit"
                                        className="btn btn-primary" onClick={(event) => this.handleShow(file)}>
                                    Rename
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