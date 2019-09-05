import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";
import axios from "axios";
import {cancelTask, getExperimentById, getTreeByNumber} from "../../actions/experiments";

let redirectMe;

class ExperimentDetails extends Component {
    static propTypes = {
        experiment: PropTypes.object.isRequired,
        token: PropTypes.string.isRequired,
        getTreeByNumber: PropTypes.func.isRequired,
        redirectMe: PropTypes.bool,
    };

    error() {
        const errorMessage = this.props.experiment.error_message;
        console.log(errorMessage);
        if (errorMessage) {
            return "Error: " + errorMessage;
        }
    };

    // todo delete after test
    // download() {
    //     const status = this.props.experiment.status;
    //
    //     if (status === "Finished" || status === "Error") {
    //         const path = "api/files?id=".concat(this.props.experiment.id);
    //         return <a className="card-text" href={path}>Download files</a>
    //     }
    // }

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

    render() {
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

        if (this.props.experiment.status !== "Error" && this.props.experiment.status !== "Canceled") {
            return (
                <div className="card border-primary mb-3">
                    <div className="card-header">Experiment with id: {this.props.experiment.id}</div>
                    <div className="card-body">
                        <h4 className="card-title">Name: {this.props.experiment.name}</h4>
                        <p className="card-text">Description: {this.props.experiment.description}</p><br/>
                        <p className="card-text">Date: {this.props.experiment.date}</p><br/>
                        <p className="card-text">Status: {this.props.experiment.status}</p><br/>
                        <p className="card-text">Config file: {this.props.experiment.config_file_name}</p><br/>
                        <p className="card-text">Dataset name: {this.props.experiment.data_file_name}</p><br/>
                        <p className="card-text">{this.error()}</p><br/>
                        <button onClick={this.props.cancelTask.bind(this, this.props.experiment.id)} type="button"
                                className="btn btn-primary">Cancel Task
                        </button>
                    </div>
                </div>
            );

        }
        if (this.props.experiment.status === "Error") {
            return (
                <div className="card border-danger mb-3">
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
                    </div>
                </div>
            )
        }

        if (this.props.experiment.status === "Canceled") {
            return (
                <div className="card border-danger mb-3">
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
                    </div>
                </div>
            )
        }

        if (this.props.experiment.status === "Finished") {
            return (
                <div>
                    <div className="card border-success mb-3">
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
                        </div>
                    </div>
                </div>
            );
        }

    }
}

const
    mapStateToProps = state => ({
        experiment: state.experiments.experiment,
        token: state.auth.token,
        redirectMe: state.experiments.redirectMe,
    });

export default connect(mapStateToProps, {getTreeByNumber, getExperimentById, cancelTask})

(
    ExperimentDetails
)
;