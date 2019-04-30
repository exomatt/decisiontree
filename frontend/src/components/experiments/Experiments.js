import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {deleteExperiment, getExperiments} from "../../actions/experiments";


class Experiments extends Component {
    static propTypes = {
        experiments: PropTypes.array.isRequired
    };

    componentDidMount() {
        this.props.getExperiments();
    }

    render() {
        return (
            <div>
                <h1>Experiments:</h1>
                <table className="table table-striped">
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
                            <td>{experiment.date}</td>
                            <td>
                                <button type="button" className="btn btn-primary">Show</button>
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

export default connect(mapStateToProps, {getExperiments, deleteExperiment})(Experiments);