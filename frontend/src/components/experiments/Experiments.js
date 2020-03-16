import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {getExperimentById, getExperiments} from "../../actions/experiments";
import {Link} from "react-router-dom";
import moment from "moment";
import "./index.css"

class Experiments extends Component {
    static propTypes = {
        experiments: PropTypes.array.isRequired,
        getExperiments: PropTypes.func.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        group: PropTypes.array.isRequired,
    };

    state = {
        interval: null
    };

    componentDidMount() {
        if (this.props.experiments) {
            this.props.getExperiments();
        }
        if (this.state.interval)
            this.state.interval.clear();
        this.setState({interval: null});
    }

    componentDidUpdate(nextProps, nextState, nextContext) {
        if (!this.state.interval) {
            const interval = setInterval(() => {
                this.props.getExperiments();
            }, 15000);
            this.setState({interval: interval})
        }

    }

    componentWillUnmount() {
        console.log("Jestem w niszczycielu experymetny");
        clearInterval(this.state.interval);
    }

    renderButton() {
        if (this.props.group !== null)
            if (this.props.group.includes('2_exp') || this.props.group.includes('3_exp_data')) {
                return <div><Link to={"/newExperiment"} className={"btn btn-primary"}>New Experiment</Link></div>
            }
    }

    render() {
        //todo fix input field
        return (
            <div>
                <h1>Experiments:</h1>
                {this.renderButton()}
                <table className="table table-striped" datapagesize={5}>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created at</th>
                        <th>Option</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.experiments.map(experiment => (
                        <tr key={experiment.id}>
                            <td>{experiment.name}</td>
                            <td>{experiment.description}</td>
                            <td>{experiment.status}</td>
                            <td>{moment(experiment.date).format("DD.MM.YYYY hh:mm:ss")}</td>
                            <td>
                                <Link to={`/showExperiment/${experiment.id}`} className={"btn btn-primary"}>Show</Link>
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
    experiments: state.experiments.experiments,
    group: state.auth.group
});

export default connect(mapStateToProps, {
    getExperiments,
    getExperimentById,
})(Experiments);