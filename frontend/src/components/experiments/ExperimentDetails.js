import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";
import axios from "axios";
import {
    cancelTask,
    changeExperimentName,
    getExperimentById,
    getProgress,
    getTreeByNumber, shareExperiment
} from "../../actions/experiments";
import ProgressBar from "react-bootstrap/ProgressBar";
import {Modal} from "react-bootstrap";


class ExperimentDetails extends Component {
    static propTypes = {
        experiment: PropTypes.object.isRequired,
        token: PropTypes.string.isRequired,
        getTreeByNumber: PropTypes.func.isRequired,
        getProgress: PropTypes.func.isRequired,
        changeExperimentName: PropTypes.func.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        shareExperiment: PropTypes.func.isRequired,
        redirectMe: PropTypes.bool,
        progress: PropTypes.object,
    };

    state = {
        isShowingModal: false,
        isShowingModalShare: false,
        name: '',
        username: ''
    };

    onChange = e => this.setState({[e.target.name]: e.target.value});
    handleShow = () => this.setState({isShowingModal: true});
    handleShowShare = () => this.setState({isShowingModalShare: true});

    handleClose = () => this.setState({isShowingModal: false});
    handleCloseShare = () => this.setState({isShowingModalShare: false});
    handleSubmit = () => {
        let object = {
            id: this.props.experiment.id,
            new_name: this.state.name
        };
        console.log(object);
        this.props.changeExperimentName(object);
        this.setState({
            isShowingModal: false,
            name: ''
        });
        this.props.getExperimentById(this.props.experiment.id);
    };
    handleSubmitShare = () => {
        this.props.shareExperiment(this.props.experiment.id, this.state.username);
        this.setState({
            isShowingModalShare: false,
            username: ''
        });
        this.props.getExperimentById(this.props.experiment.id);
    };

    error() {
        const errorMessage = this.props.experiment.error_message;
        console.log(errorMessage);
        if (errorMessage) {
            return "Error: " + errorMessage;
        }
    };


    download() {
        const id = this.props.experiment.id;
        const name = this.props.experiment.name;
        const filename = "".concat(id, "_", name, ".zip");
        //Get token from state
        const token = this.props.token;

        // Headers and Params
        const config =
            {
                params: {
                    'id': id
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
        axios.get("api/files",
            config)
            .then((response) => {
                console.log(response.data);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename); //or any other extension
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => console.log(error));
    }

    renderButton() {
        const status = this.props.experiment.status;
        if (status === "Finished" || status === "Error") {
            return <button type="submit" className="btn btn-primary" onClick={() => {
                this.download()
            }}>Download File
            </button>
        }
    }

    componentDidMount() {
        if (this.props.experiment.status === "Running") {
            this.props.getProgress(this.props.experiment.id);
            this.interval = setInterval(() => {
                if ((parseFloat(this.props.progress.progress_percent) * 100) >= parseFloat("95"))
                    this.props.getExperimentById(this.props.experiment.id);
                if (this.props.experiment.status === "Finished")
                    clearInterval(this.interval);
                this.props.getProgress(this.props.experiment.id);
            }, 1000);
        }
    }

    render() {
        const name = this.state.name;
        const username = this.state.username;
        let i;
        let lis = [];
        const runsNumber = this.props.experiment.runs_number;
        for (i = 0; i < runsNumber; i++) {
            lis.push(<li><Link to={"/showTree"} className={"btn btn-link"}
                               onClick={this.props.getTreeByNumber.bind(this, this.props.experiment.id, i)}>Tree from
                run number {i + 1} </Link><br/></li>);
        }
        if (this.props.redirectMe) {
            return <Redirect to='/'/>
        }
        if (!this.props.experiment.hasOwnProperty('id'))
            return (<Redirect to='/'/>);

        if (this.props.experiment.status === "Finished") {
            return (
                <div>
                    <div className="card border-success mb-3">
                        <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title>New name form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>New experiment name: </Modal.Body>
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
                        <Modal show={this.state.isShowingModalShare} onHide={this.handleCloseShare} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title>Share experiment: </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Share experiment with user by username: </Modal.Body>
                            <input type="text"
                                   className="form-control"
                                   name="username"
                                   value={username}
                                   placeholder="Enter username"
                                   onChange={this.onChange}/>
                            <Modal.Footer>
                                <button type="button"
                                        className="btn btn-secondary" onClick={this.handleClose}>
                                    Close
                                </button>
                                <button type="submit"
                                        className="btn btn-primary" onClick={this.handleSubmitShare.bind()}>
                                    Share
                                </button>
                            </Modal.Footer>
                        </Modal>
                        <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                        <div className="card-body">
                            <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                            <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                            <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                            <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                            <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                            <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                            {lis}
                            {this.renderButton()}
                            <button type="button"
                                    className="btn btn-primary" onClick={this.handleShow.bind()}>
                                Change name
                            </button>
                            <button type="button"
                                    className="btn btn-primary" onClick={this.handleShowShare.bind()}>
                                Share experiment
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        if (this.props.experiment.status !== "Error" && this.props.experiment.status !== "Canceled") {
            return (
                <div className="card border-primary mb-3">
                    <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                        <Modal.Header closeButton>
                            <Modal.Title>New name form</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>New experiment name: </Modal.Body>
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
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <ProgressBar animated now={parseFloat(this.props.progress.progress_percent) * 100}
                                     label={`${(parseFloat(this.props.progress.progress_percent) * 100).toFixed(2)}%`}/>
                        <p className="card-text">Time
                            left: ~{(parseFloat(this.props.progress.time) / 60).toFixed()} minutes </p><br/>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <button onClick={this.props.cancelTask.bind(this, this.props.experiment.id)} type="button"
                                className="btn btn-primary">Cancel Task
                        </button>
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShow.bind()}>
                            Change name
                        </button>
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShowShare.bind()}>
                            Share experiment
                        </button>
                    </div>
                </div>
            );

        }
        if (this.props.experiment.status === "Error") {
            return (
                <div className="card border-danger mb-3">
                    <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                        <Modal.Header closeButton>
                            <Modal.Title>New name form</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>New experiment name: </Modal.Body>
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
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>
                        {this.renderButton()}
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShow.bind()}>
                            Change name
                        </button>
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShowShare.bind()}>
                            Share experiment
                        </button>
                    </div>
                </div>
            )
        }

        if (this.props.experiment.status === "Canceled") {
            return (
                <div className="card border-danger mb-3">
                    <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
                        <Modal.Header closeButton>
                            <Modal.Title>New name form</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>New experiment name: </Modal.Body>
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
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>
                        {this.renderButton()}
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShow.bind()}>
                            Change name
                        </button>
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleShowShare.bind()}>
                            Share experiment
                        </button>
                    </div>
                </div>
            )
        }


    }
}

const
    mapStateToProps = state => ({
        experiment: state.experiments.experiment,
        token: state.auth.token,
        redirectMe: state.experiments.redirectMe,
        progress: state.experiments.progress,
    });

export default connect(mapStateToProps, {
    getTreeByNumber,
    getExperimentById,
    cancelTask,
    getProgress,
    changeExperimentName,
    shareExperiment
})(ExperimentDetails);