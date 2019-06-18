import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Redirect} from "react-router-dom";
import axios from "axios";


class ExperimentDetails extends Component {
    static propTypes = {
        experiment: PropTypes.object.isRequired,
        token: PropTypes.string.isRequired
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
        if (!this.props.experiment.hasOwnProperty('id'))
            return (<Redirect to='/'/>);
        if (this.props.experiment.error_message) {
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
                        {/*{this.download()}*/}
                        {/*<a className="card-text"*/}
                        {/*   href={"/home/exomat/Pulpit/decisionTree/users/test11/116_asdasd/116_asdasd.zip"}>download*/}
                        {/*    file </a>*/}
                        {this.renderButton()}
                    </div>
                </div>
            )
        }
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
                        {this.renderButton()}
                        {/*<a className="card-text" href={"localhost:8000/api/files?id=116dddd"}>download file </a>*/}
                        {/*<Link to={"/showTree"} className={"btn btn-primary"}*/}
                        {/*             onClick={this.props.getExperimentById.bind(this, experiment.id)}>Tree</Link>*/}
                        {/*{this.download()}*/}
                        {/*<button onClick={this.download2()}>tag</button>*/}
                        {/*<button type="submit" onClick={() => {*/}
                        {/*    this.download()*/}
                        {/*}}>tag*/}
                        {/*</button>*/}
                    </div>
                </div>
            </div>
        );
    }
}

const
    mapStateToProps = state => ({
        experiment: state.experiments.experiment,
        token: state.auth.token
    });

export default connect(mapStateToProps)

(
    ExperimentDetails
)
;