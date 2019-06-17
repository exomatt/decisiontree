import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";


class ExperimentDetails extends Component {
    static propTypes = {
        experiment: PropTypes.object.isRequired,
    };

    error() {
        const errorMessage = this.props.experiment.error_message;
        console.log(errorMessage);
        if (errorMessage) {
            return "Error: " + errorMessage;
        }
    };

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
                        <a className="card-text"
                           href={"/home/exomat/Pulpit/decisionTree/users/test11/116_asdasd/116_asdasd.zip"}>download
                            file </a>
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
                        <a className="card-text" href={"localhost:8000/api/files?id=116dddd"}>download file </a>
                        {/*<Link to={"/showTree"} className={"btn btn-primary"}*/}
                        {/*             onClick={this.props.getExperimentById.bind(this, experiment.id)}>Tree</Link>*/}
                    </div>
                </div>
                {/*<label>Experiment with id: {this.props.experiment.id}</label>*/}
                {/*<label>Name: {this.props.experiment.name}</label>*/}
                {/*<label>Description: {this.props.experiment.description}</label>*/}
                {/*<label>Date: {this.props.experiment.date}</label>*/}
                {/*<label>Status: {this.props.experiment.status}</label>*/}
                {/*<label>Config file: {this.props.experiment.config_file_name}</label>*/}
                {/*<label>Dataset name: {this.props.experiment.data_file_name}</label>*/}
                {/*<label>Dataset name: {this.props.experiment.data_file_name}</label>*/}
                {/*<label>{this.error()}</label>*/}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    experiment: state.experiments.experiment
});

export default connect(mapStateToProps)(ExperimentDetails);