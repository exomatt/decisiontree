import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {deleteExperiment, getExperimentById, getExperiments} from "../../actions/experiments";
import {Link} from "react-router-dom";
import moment from "moment";

class Experiments extends Component {
    static propTypes = {
        experiments: PropTypes.array.isRequired,
        getExperiments: PropTypes.func.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        deleteExperiment: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getExperiments();
    }

    render() {
        //todo fix input field
        return (
            <div>
                <h1>Experiments:</h1>
                <Link to={"/newExperiment"} className={"btn btn-primary"}>New Experiment</Link>
                <table className="table table-striped" datapagesize={5}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.experiments.map(experiment => (
                        <tr key={experiment.id}>
                            <td>{experiment.id}</td>
                            <td>{experiment.name}</td>
                            <td>{experiment.description}</td>
                            <td>{experiment.status}</td>
                            <td>{moment(experiment.date).format("DD.MM.YYYY hh:mm:ss")}</td>
                            <td>
                                <Link to={`/showExperiment/${experiment.id}`} className={"btn btn-primary"}>Show</Link>
                            </td>
                            <td>
                                <button onClick={this.props.deleteExperiment.bind(this, experiment.id)} type="button"
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
    experiments: state.experiments.experiments
});

export default connect(mapStateToProps, {
    getExperiments,
    getExperimentById,
    deleteExperiment,
})(Experiments);