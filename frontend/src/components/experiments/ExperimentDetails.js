import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar";
import {Modal} from "react-bootstrap";
import {
    cancelTask,
    changeExperimentCrud,
    copyExperiment,
    deleteExperiment,
    getExperimentById,
    getExperimentPermission,
    getProgress,
    getTreeByNumber,
    rerunTask,
    shareExperiment,
    startTask
} from "../../actions/experiments";
import {createMessage} from "../../actions/messages";
import {connect} from "react-redux";
import {getFiles} from "../../actions/files";
import "./index.css"
import {loadUserGroup} from "../../actions/auth";
import moment from "moment";


class ExperimentDetails extends Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        loadUserGroup: PropTypes.func.isRequired,
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
        group: PropTypes.array.isRequired,
        deleteExperiment: PropTypes.func.isRequired,
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
        copy: false,
        delete: false,
        owner: false,
        interval: null,
        intervalIQ: null,
    };

    componentDidMount() {
        this.props.loadUserGroup();
        // todo   get permissions and block functions
        this.props.getExperimentById(this.props.match.params.id);
        if (this.props.group.includes('2_exp') || this.props.group.includes('3_exp_data')) {
            this.props.getFiles();
        }
        if (this.state.interval)
            this.state.interval.clear();
        this.setState({interval: null});
        if (this.state.intervalIQ)
            this.state.intervalIQ.clear();
        this.setState({intervalIQ: null});
    }

    componentDidUpdate(nextProps, nextState, nextContext) {
        if (this.props.experiment.shared_from === '' && this.state.owner === false) {
            this.setState({
                    owner: true
                }
            )
        } else if (Object.getOwnPropertyNames(this.props.permission).length == 0) {
            this.props.getExperimentPermission(this.props.match.params.id);
        }
        if (this.props.experiment && this.props.experiment.status === "Running") {
            if (!this.state.interval) {
                const interval = setInterval(() => {
                    this.props.getProgress(this.props.experiment.id);
                    if ((parseFloat(this.props.progress.progress_percent) * 100) >= parseFloat("95"))
                        this.props.getExperimentById(this.props.experiment.id);
                    if (this.props.experiment.status === "Finished" || this.props.experiment.status === "Canceled")
                        clearInterval(this.state.interval);
                }, 5000)
                this.setState({interval: interval})
            }
        } else {
            if (this.props.experiment && this.props.experiment.status === "In queue") {
                if (!this.state.intervalIQ) {
                    console.log("jestem w IQ");
                    const interval = setInterval(() => {
                        this.props.getExperimentById(this.props.experiment.id);
                    }, 15000);
                    this.setState({intervalIQ: interval})
                }

            }
        }
    }

    componentWillUnmount() {
        console.log("Jestem w niszczycielu");
        clearInterval(this.state.interval);
        clearInterval(this.state.intervalIQ);
    }


    onChange = e => this.setState({[e.target.name]: e.target.value});
    handleShow = () => this.setState({
        isShowingModal: true,
        name: this.props.experiment.name,
        description: this.props.experiment.description
    });
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
            copy: this.state.copy,
            delete: this.state.delete,
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
            delete: false,
            copy: false,
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
                // console.log(response.data);
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
                           className="btn btn-primary" onClick={this.handleShowShare}>
                Share experiment
            </button>

        }
    }

    renderEditButton() {
        if (this.props.permission.edit === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary" onClick={this.handleShow}>
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
        if (this.props.permission.copy === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary"
                           onClick={this.props.copyExperiment.bind(this, this.props.experiment.id)}>
                Create copy
            </button>
        }
    }

    renderDeleteButton() {
        if (this.props.permission.delete === true || this.state.owner === true) {
            return <button type="button"
                           className="btn btn-primary"
                           onClick={this.props.deleteExperiment.bind(this, this.props.experiment.id)}>
                Delete
            </button>
        }
    }

    renderForm() {
        console.log(this.props.experiment)
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
                <label>File in use: {this.props.experiment.config_file_name}</label><br/>
                <label>Choose new config file</label>
                <select className="form-control"
                        name="config_file_name"
                        value={config_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsXml}
                </select>
            </div>
            <div className="form-group">
                <label>File in use:: {this.props.experiment.data_file_name}</label><br/>
                <label>Choose new data file</label>
                <select className="form-control"
                        name="data_file_name"
                        value={data_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsData}
                </select>
            </div>
            <div className="form-group">
                <label>File in use:: {this.props.experiment.test_file_name}</label><br/>
                <label>Choose new test file</label>
                <select className="form-control"
                        name="test_file_name"
                        value={test_file_name}
                        onChange={this.onChange}>
                    <option value="select">Select an Option</option>
                    {optionItemsTest}
                </select>
            </div>
            <div className="form-group">

                <label>File in use:: {this.props.experiment.names_file_name}</label><br/>
                <label>Choose new names file</label>
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
                <Modal.Title>Edit experiment</Modal.Title>
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
                    {this.copyCheckBox()}
                    {this.deleteCheckBox()}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button"
                            className="btn btn-secondary" onClick={this.handleCloseShare}>
                        Close
                    </button>
                    <button type="button"
                            className="btn btn-primary" onClick={this.handleSubmitShare.bind(this)}>
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

    copyCheckBox() {
        if (this.props.permission.copy === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch6"
                       checked={this.state.copy} onChange={() => {
                    this.setState({
                        copy: !this.state.copy
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch6">Making copy</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch6" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch6">Making copy (blocked by the
                    host)</label>
            </div>
        }
    }

    deleteCheckBox() {
        if (this.props.permission.delete === true || this.state.owner) {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch7"
                       checked={this.state.delete} onChange={() => {
                    this.setState({
                        delete: !this.state.delete
                    });
                }}/>
                <label className="custom-control-label" htmlFor="customSwitch7">Delete experiment</label>
            </div>
        } else {
            return <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch7" disabled=""
                       checked={false}/>
                <label className="custom-control-label" htmlFor="customSwitch7">Delete experiment (blocked by the
                    host)</label>
            </div>
        }
    }

    time() {
        const time = (parseFloat(this.props.progress.time) / 60).toFixed();
        const percent = (parseFloat(this.props.progress.progress_percent) * 100).toFixed(2);
        if (time <= 0 && percent > 0) {
            return <p>
                Time left: ~{time} minutes.
            </p>
        }
        if (time <= 0) {
            return <p>
                Time left: Calculate Time...
            </p>
        } else if (time > 0) {
            return <p>
                Time left: ~{time} minutes.
            </p>
        }

    }

    percent() {
        const percent = (parseFloat(this.props.progress.progress_percent) * 100).toFixed(2);
        if (percent > 100) {
            return 100;
        } else {
            return percent;
        }
    }

    animPercent() {
        const percent = parseFloat(this.props.progress.progress_percent) * 100;
        if (percent > 100) {
            return 100;
        } else {
            return percent
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
            return <Redirect to='/experiments'/>
        }
        //todo dodac znaczek ładowania
        if (!this.props.experiment.hasOwnProperty('id'))
            return (<div className="spinner-border text-secondary" role="status">
                <span className="sr-only">Loading...</span>
            </div>);

        if (this.props.experiment.status === "Finished") {
            return (
                <div>
                    <div className="card border-success mb-3 shadow p-3 mb-5 bg-white rounded">
                        {this.editExperiment()}
                        {this.shareExperiment()}
                        <div className="card-header">
                            {this.renderDownloadButton()}
                            {this.renderEditButton()}
                            {this.renderRerunButton()}
                            {this.renderCopyButton()}
                            {this.renderShareButton()}
                            {this.renderDeleteButton()}

                        </div>
                        <div className="card-body">
                            <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                            <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                            <p className="card-text">Created
                                at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                            <br/>
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
                <div className="card border-primary mb-3 shadow p-3 mb-5 bg-white rounded">
                    <div className="card-header">
                        <button onClick={this.props.cancelTask.bind(this, this.props.experiment.id)} type="button"
                                className="btn btn-primary">Cancel Task
                        </button>
                    </div>
                    <div className="card-body">
                        <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                        <ProgressBar animated now={this.animPercent()}
                                     label={`${this.percent()}%`}/>
                        {/*<p className="card-text">Time*/}
                        {/*    left: ~{(parseFloat(this.props.progress.time) / 60).toFixed()} minutes </p><br/>*/}
                        {this.time()}
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Created
                            at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                        <br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>

                    </div>
                </div>
            );

        }
        if (this.props.experiment.status === "Error") {
            return (
                <div className="card border-danger mb-3 shadow p-3 mb-5 bg-white rounded">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderRerunButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                        {this.renderDeleteButton()}
                    </div>
                    <div className="card-body">
                        <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Created
                            at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                        <br/>
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
                <div className="card border-danger mb-3 shadow p-3 mb-5 bg-white rounded">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderRerunButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                        {this.renderDeleteButton()}
                    </div>
                    <div className="card-body">
                        <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Created
                            at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                        <br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                    </div>
                </div>
            );
        }
        if (this.props.experiment.status === "Created") {
            return (
                <div className="card border-primary mb-3 shadow p-3 mb-5 bg-white rounded">
                    {this.editExperiment()}
                    {this.shareExperiment()}
                    <div className="card-header">
                        {this.renderDownloadButton()}
                        {this.renderEditButton()}
                        {this.renderStartButton()}
                        {this.renderCopyButton()}
                        {this.renderShareButton()}
                        {this.renderDeleteButton()}
                    </div>
                    <div className="card-body">
                        <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Created
                            at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                        <br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>

                    </div>
                </div>
            )
        }
        if (this.props.experiment.status === "In queue") {
            return (
                <div className="card border-primary mb-3 shadow p-3 mb-5 bg-white rounded">
                    <div className="card-header">
                        <button onClick={this.props.cancelTask.bind(this, this.props.experiment.id)} type="button"
                                className="btn btn-primary">Cancel Task
                        </button>
                    </div>
                    <div className="card-body">
                        <p className="card-text"><b>Experiment with name: {this.props.experiment.name}</b></p><br/>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Created
                            at: {moment(this.props.experiment.date).format("DD.MM.YYYY hh:mm:ss")}</p>
                        <br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>

                    </div>
                </div>
            );
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
        files: state.files.files,
        group: state.auth.group
    });

export default connect(mapStateToProps, {
    getTreeByNumber,
    getExperimentById,
    loadUserGroup,
    cancelTask,
    rerunTask,
    startTask,
    getProgress,
    changeExperimentCrud,
    createMessage,
    copyExperiment,
    shareExperiment,
    getFiles,
    deleteExperiment,
    getExperimentPermission
})(ExperimentDetails);