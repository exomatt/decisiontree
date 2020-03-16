import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Tree from 'react-d3-tree';
import {Link, Redirect} from "react-router-dom";
import {getExperimentById} from "../../actions/experiments";
import ReactToPrint from 'react-to-print';
import "./index.css"
import moment from "moment";
import {createMessage} from "../../actions/messages";

class ShowTree extends Component {
    static propTypes = {
        tree: PropTypes.object.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        createMessage: PropTypes.func.isRequired,
        experiment: PropTypes.object.isRequired,
    };
    state = {
        back: false,
        navigate: false
    };

    back = () => {
        if (Object.keys(this.props.experiment).length === 0 && this.props.experiment.constructor === Object) {
            this.props.createMessage({problemExperimentID: 'Problem with retrieving experiment data. Redirect to  experiments table.'});
            this.setState({back: true});

        } else {
            this.props.getExperimentById(this.props.experiment.id);
            this.setState({navigate: true});
        }
    };

    render() {
        // console.log(this.state);
        const navigate = this.state.navigate;
        const back = this.state.back;
        if (navigate) {
            this.setState({navigate: false});
            return <Redirect to={`/showExperiment/${this.props.experiment.id}`}/>
        }
        if (back) {
            this.setState({back: false});
            return <Redirect to={`/experiments`}/>
        }
        // console.log(this.props.tree);
        if (Object.keys(this.props.tree).length === 0 && this.props.tree.constructor === Object) {
            return (
                <div>
                    <div>
                        <button
                            className={"btn btn-primary"}
                            onClick={this.back}>Back
                            to
                            experiment
                        </button>
                    </div>
                </div>
            );
        } else {
            return (

                <div>
                    <button
                        className={"btn btn-primary"}
                        onClick={this.back}>Back
                        to
                        experiment
                    </button>
                    <ReactToPrint
                        trigger={() => <a className="btn btn-primary" href="#">Print this out!</a>}
                        content={() => this.componentRef}
                        pageStyle={"<style type=\"text/css\">\n" +
                        "  @media print{\n" +
                        "    @page {\n" +
                        "      size: landscape;\n" +
                        "    }\n" +
                        "  }\n" +
                        "</style>"}
                    />
                    <table className="table table-striped" datapagesize={5}>
                        <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr key='tree_size'>
                            <td>Tree Size</td>
                            <td>{this.props.tree['Tree Size']}</td>
                        </tr>
                        <tr key='time'>
                            <td>Time</td>
                            <td>{this.props.tree['Time']}</td>
                        </tr>
                        <tr key='ev_train'>
                            <td>Evaluation on training data</td>
                            <td>{this.props.tree['Evaluation on training data']} items</td>
                        </tr>
                        <tr key='res_train'>
                            <td>Result on training data</td>
                            <td>{this.props.tree['Result on training data']}%</td>
                        </tr>
                        <tr key='ev_test'>
                            <td>Evaluation on test data</td>
                            <td>{this.props.tree['Evaluation on test data']} items</td>
                        </tr>
                        <tr key='res_test'>
                            <td>Result on test data</td>
                            <td>{this.props.tree['Result on test data']}%</td>
                        </tr>
                        </tbody>
                    </table>
                    <div id="treeWrapper" style={{width: '150em', height: '50em'}}>
                        <Tree ref={el => (this.componentRef = el)} data={this.props.tree['tree']}
                              orientation={'vertical'}
                              separation={{siblings: 2, nonSiblings: 2}}
                              translate={{x: 600, y: 200}} zoom={0.5}/>
                    </div>

                </div>

            );
        }
    }
}

const mapStateToProps = state => ({
    tree: state.experiments.tree,
    experiment: state.experiments.experiment,
});

export default connect(mapStateToProps, {createMessage, getExperimentById})(ShowTree);
