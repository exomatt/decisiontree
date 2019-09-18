import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {deleteExperiment, getExperiments, getExperimentById} from "../../actions/experiments";
import {Link} from "react-router-dom";
import {Modal} from "react-bootstrap"
import Button from "react-bootstrap/Button";

class Experiments extends Component {
    static propTypes = {
        experiments: PropTypes.array.isRequired,
        getExperiments: PropTypes.func.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        deleteExperiment: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.getExperiments();
    }

    state = {
        isShowingModal: false,
        name: ''
    };

    onChange = e => this.setState({[e.target.name]: e.target.value});
    handleShow = () => this.setState({isShowingModal: true});
    handleClose = () => this.setState({isShowingModal: false});
    handleSubmit = () => {
        this.setState({
            isShowingModal: false,
            name: ''
        });
        console.log("new name: " + this.state.name)
    };


    render() {
        const name = this.state.name;
        //todo fix input field
        return (
            <div>
                <Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={false}>
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
                        <button type="button"
                                className="btn btn-primary" onClick={this.handleSubmit}>
                            Save Changes
                        </button>
                    </Modal.Footer>
                </Modal>
                <h1>Experiments:</h1>
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
                            <td>{experiment.date}</td>
                            <td>
                                <button type="button"
                                        className="btn btn-primary" onClick={this.handleShow}>
                                    Change name
                                </button>
                            </td>
                            <td>
                                <Link to={"/showExperiment"} className={"btn btn-primary"}
                                      onClick={this.props.getExperimentById.bind(this, experiment.id)}>Show</Link>
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
    deleteExperiment
})(Experiments);