import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar";
import {Modal} from "react-bootstrap";
import {
    cancelTask,
    changeExperimentCrud, copyExperiment,
    getExperimentById, getExperimentPermission,
    getProgress,
    getTreeByNumber,
    rerunTask,
    shareExperiment,
    startTask
} from "../../actions/experiments";
import {createMessage} from "../../actions/messages";
import {connect} from "react-redux";
import {getFiles} from "../../actions/files";


class ExperimentDetails extends Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        experiment: PropTypes.object.isRequired,
        token: PropTypes.string.isRequired,
        getTreeByNumber: PropTypes.func.isRequired,
        getProgress: PropTypes.func.isRequired,
        changeExperimentCrud: PropTypes.func.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        createMessage: PropTypes.func.isRequired,
        cancelTask: PropTypes.func.isRequired,
        rerunTask: PropTypes.func.isRequired,
        startTask: PropTypes.func.isRequired,
        copyExperiment: PropTypes.func.isRequired,
        shareExperiment: PropTypes.func.isRequired,
        getExperimentPermission: PropTypes.func.isRequired,
        redirectMe: PropTypes.bool,
        progress: PropTypes.object,
        permission: PropTypes.object,
    };

    state = {
        isShowingModal: false,
        isShowingModalShare: false,
        name: '',
        username: '',
        description: '',
        config_file_name: '',
        data_file_name: '',
        test_file_name: '',
        names_file_name: '',
        run: false,
        edit: false,
        downloadIn: false,
        downloadOut: false,
        share: false,
        owner: false,
        interval: {}
    };

    componentDidMount() {
        // todo   get permissions and block functions
        this.props.getExperimentById(this.props.match.params.id);
        this.props.getFiles();
        if (this.props.experiment.shared_from === "") {
            this.setState({
                    owner: true
                }
            )
        } else {
            this.props.getExperimentPermission(this.props.match.params.id)
        }
        if (this.props.experiment.status === "Running") {
            console.log("here update ")
            this.state.interval = setInterval(() => {
                this.props.getProgress(this.props.experiment.id);
                if ((parseFloat(this.props.progress.progress_percent) * 100) >= parseFloat("95"))
                    this.props.getExperimentById(this.props.experiment.id);
                if (this.props.experiment.status === "Finished")
                    clearInterval(this.interval);
                this.props.getProgress(this.props.experiment.id);
            }, 5000);
        }

    }

    onChange = e => this.setState({[e.target.name]: e.target.value});
    handleShow = () => this.setState({isShowingModal: true});
    handleShowShare = () => this.setState({isShowingModalShare: true});

    handleClose = () => this.setState({isShowingModal: false});
    handleCloseShare = () => this.setState({isShowingModalShare: false});
    handleSubmit = () => {
        let object = {
            id: this.props.experiment.id,
        };
        if (this.state.name === '' && this.state.description === '' && this.state.config_file_name === ''
            && this.state.data_file_name === '' && this.state.test_file_name === '' && this.state.names_file_name === '') {
            this.props.createMessage({emptyField: 'Please fill at least one of  field'});
            return;
        }
        if (this.state.name !== '') {
            object.new_name = this.state.name;
        }
        if (this.state.description !== '') {
            object.new_desc = this.state.description;
        }
        if (this.state.config_file_name !== '') {
            object.new_config = this.state.config_file_name;
        }
        if (this.state.data_file_name !== '') {
            object.new_data = this.state.data_file_name;
        }
        if (this.state.test_file_name !== '') {
            object.new_test = this.state.test_file_name;
        }
        if (this.state.names_file_name !== '') {
            object.new_names = this.state.names_file_name;
        }
        this.props.changeExperimentCrud(object);
        this.setState({
            isShowingModal: false,
            name: '',
            description: '',
            config_file_name: '',
            data_file_name: '',
            test_file_name: '',
            names_file_name: ''
        });
        this.props.getExperimentById(this.props.experiment.id);
    };
    handleSubmitShare = () => {
        console.log(this.state);
        if (this.state.username === '') {
            this.props.createMessage({emptyField: 'Please fill username field'});
            return;
        }
        const shareOptions = {
            id: this.props.experiment.id,
            username: this.state.username,
            run: this.state.run,
            edit: this.state.edit,
            download_out: this.state.downloadOut,
            download_in: this.state.downloadIn,
            share: this.state.share,
        };
        this.props.shareExperiment(shareOptions);
        this.setState({
            isShowingModalShare: false,
            username: '',
            run: false,
            edit: false,
            downloadIn: false,
            downloadOut: false,
            share: false,
        });
        this.props.getExperimentById(this.props.experiment.id);
    };

    error() {
        const errorMessage = this.props.experiment.error_message;
        if (errorMessage) {
            return "Errors: " + errorMessage;
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

    renderDownloadButton() {
        if (this.props.permission.download_in === true || this.props.permission.download_out === true || this.state.owner === true) {
            const status = this.props.experiment.status;
            if (status === "Finished" || status === "Error" || status === "Created" || status === "Canceled") {
                return <button type="submit" className="btn btn-primary" onClick={() => {
                    this.download()
                }}>Download File
                </button>
            }
        }
    }

    renderShareButton() {
        if (this.props.permission.share === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary" onClick={this.handleShowShare.bind()}>
                Share experiment
            </button>

        }
    }

    renderEditButton() {
        if (this.props.permission.edit === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary" onClick={this.handleShow.bind()}>
                Edit experiment
            </button>

        }
    }

    renderRerunButton() {
        if (this.props.permission.run === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary"
                           onClick={this.props.rerunTask.bind(this, this.props.experiment.id)}>
                Rerun
            </button>
        }
    }

    renderStartButton() {
        if (this.props.permission.run === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary"
                           onClick={this.props.startTask.bind(this, this.props.experiment.id)}>
                Start
            </button>
        }
    }

    renderCopyButton() {
        return <button type="button"
                       className="btn btn-primary"
                       onClick={this.props.copyExperiment.bind(this, this.props.experiment.id)}>
            Create copy
        </button>

    }

    renderForm() {
        const {name, description, config_file_name, data_file_name, test_file_name, names_file_name} = this.state;
        let xml_files = this.props.files.filter(file => file.endsWith(".xml"));
        let data_files = this.props.files.filter(file => file.endsWith(".data"));
        let names_files = this.props.files.filter(file => file.endsWith(".names"));
        let test_files = this.props.files.filter(file => file.endsWith(".test"));
        let optionItemsXml = xml_files.map((file) =>
            <option key={file}>{file}</option>
        );
        let optionItemsData = data_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 5)}>{file}</option>
        );
        let optionItemsNames = names_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 6)}>{file}</option>
        );
        let optionItemsTest = test_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 5)}>{file}</option>
        );
        return <fieldset>
            <div className="form-group">
                <label>Experiment name</label>
                <input type="text"
                       className="form-control"
                       name="name"
                       value={name}
                       placeholder="Enter name"
                       onChange={this.onChange}/>

            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea className="form-control"
                          name="description"
                          value={description}
                          rows="3" cols="3"
                          id="textAreaFormExperiment"
                          onChange={this.onChange}/>
            </div>
            <div className="form-group">
                <label>Config file</label>
                <select className="form-control"
                        name="config_file_name"
                        value={config_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsXml}
                </select>
            </div>
            <div className="form-group">
                <label>Data file</label>
                <select className="form-control"
                        name="data_file_name"
                        value={data_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsData}
                </select>
            </div>
            <div className="form-group">
                <label>Test file</label>
                <select className="form-control"
                        name="test_file_name"
                        value={test_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsTest}
                </select>
            </div>
            <div className="form-group">
                <label>Names file</label>
                <select className="form-control"
                        name="names_file_name"
                        value={names_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsNames}
                </select>
            </div>
        </fieldset>
    }

    editExperiment() {
        return <div><Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>
            <Modal.Header closeButton>
                <Modal.Title>New name form</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.renderForm()}</Modal.Body>
            <Modal.Footer>
                <button type="button"
                        className="btn btn-secondary" onClick={this.handleClose}>
                    Close
                </button>
                <button type="button"
                        className="btn btn-primary" onClick={this.handleSubmit.bind()}>
                    Save Changes
                </button>
            </Modal.Footer>
        </Modal></div>
    }

    shareExperiment() {
        const username = this.state.username;
        return <div>
            <Modal show={this.state.isShowingModalShare} onHide={this.handleCloseShare} animation={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Share experiment with user by username: </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text"
                           className="form-control"
                           name="username"
                           value={username}
                           placeholder="Enter username"
                           onChange={this.onChange}/>
                    <br/>
                    <h4>Permissions to: </h4>

                    {this.runCheckBox()}
                    {this.editCheckBox()}
                    {this.downloadInCheckBox()}
                    {this.downloadOutCheckBox()}
                    {this.shareCheckBox()}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button"
                            className="btn btn-secondary" onClick={this.handleCloseShare}>
                        Close
                    </button>
                    <button type="button"
                            className="btn btn-primary" onClick={this.handleSubmitShare.bind()}>
                        Share
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    }

    editCheckBox() {
        if (this.props.permission.edit === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch2"
                       checked={this.state.edit} onChange={() => {
                    this.setState({
                        edit: !this.state.edit
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch2">Edit experiment</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch2" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch2">Edit experiment (blocked by the
                    host)</label>
            </div>
        }
    }

    runCheckBox() {
        if (this.props.permission.run === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch1"
                       checked={this.state.run} onChange={() => {
                    this.setState({
                        run: !this.state.run
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch1">Run experiment</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch1" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch1">Run experiment (blocked by the
                    host)</label>
            </div>
        }
    }

    downloadInCheckBox() {
        if (this.props.permission.download_in === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch3"
                       checked={this.state.downloadIn} onChange={() => {
                    this.setState({
                        downloadIn: !this.state.downloadIn
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch3">Download input files</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch3" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch3">Download input files (blocked by the
                    host)</label>
            </div>
        }
    }

    downloadOutCheckBox() {
        if (this.props.permission.download_out === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch4"
                       checked={this.state.downloadOut} onChange={() => {
                    this.setState({
                        downloadOut: !this.state.downloadOut
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch4">Download output files</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch4" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch4">Download output files (blocked by the
                    host)</label>
            </div>
        }
    }

    shareCheckBox() {
        if (this.props.permission.share === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch5"
                       checked={this.state.share} onChange={() => {
                    this.setState({
                        share: !this.state.share
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch5">Share with other users</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch1" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch5">Share with other users (blocked by the
                    host)</label>
            </div>
        }
    }

    render() {
        let i;
        let lis = [];
        const runsNumber = this.props.experiment.runs_number;
        for (i = 0; i < runsNumber; i++) {
            lis.push(<li key={i}><Link to={"/showTree"} className={"btn btn-link"}
                                       onClick={this.props.getTreeByNumber.bind(this, this.props.experiment.id, i)}>Tree
                from
                run number {i + 1} </Link><br/></li>);
        }
        if (this.props.redirectMe) {
            return <Redirect to='/'/>
        }
        //todo dodac znaczek ładowania
        if (!this.props.experiment.hasOwnProperty('id'))
            return (<div/>);

        if (this.props.experiment.status === "Finished") {
            return (
                <div>
                    <div className="card border-success mb-3">
                        {this.editExperiment()}
                        {this.shareExperiment()}
                        <div className="card-header">
                            {this.renderDownloadButton()}
                            {this.renderEditButton()}
                            {this.renderRerunButton()}
                            {this.renderCopyButton()}
                            {this.renderShareButton()}

                        </div>
                        <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                        <div className="card-body">
                            <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                            <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                            <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                            <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                            <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                            <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                            {lis}
                        </div>
                    </div>
                </div>
            );
        }
        if (this.props.experiment.status === "Running") {
            return (
                <div className="card border-primary mb-3">
                    <div className="card-header">
                        <button onClick={this.props.cancelTask.bind(this, this.props.experiment.id)} type="button"
                                className="btn btn-primary">Cancel Task
                        </button>
                    </div>
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

                    </div>
                </div>
            );

        }
        if (this.props.experiment.status === "Error") {
            return (
                <div className="card border-danger mb-3">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderRerunButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                    </div>
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>

                    </div>
                </div>
            )
        }

        if (this.props.experiment.status === "Canceled") {
            return (
                <div className="card border-danger mb-3">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderRerunButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                    </div>
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>

                    </div>
                </div>
            );
        }
        if (this.props.experiment.status === "Created") {
            return (
                <div className="card border-primary mb-3">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderStartButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                    </div>
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>

                    </div>
                </div>
            )
        }


    }
}

const
    mapStateToProps = state => ({
        experiment: state.experiments.experiment,
        permission: state.experiments.permission,
        token: state.auth.token,
        redirectMe: state.experiments.redirectMe,
        progress: state.experiments.progress,
        files: state.files.files
    });

export default connect(mapStateToProps, {
    getTreeByNumber,
    getExperimentById,
    cancelTask,
    rerunTask,
    startTask,
    getProgress,
    changeExperimentCrud,
    createMessage,
    copyExperiment,
    shareExperiment,
    getFiles,
    getExperimentPermission
})(ExperimentDetails);