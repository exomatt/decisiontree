import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Tree from 'react-d3-tree';
import {Link} from "react-router-dom";
import {getExperimentById} from "../../actions/experiments";

class ShowTree extends Component {
    static propTypes = {
        tree: PropTypes.array.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        experiment: PropTypes.object.isRequired,
    };

    render() {
        console.log(this.props.tree);
        // const parse = JSON.parse(this.tree);
        // console.log(parse)
        if (this.props.tree.length === 0) {
            return (
                <div>
                    <div>
                        <Link to={"/showExperiment"} className={"btn btn-primary"}
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back to
                            experiment</Link>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <div>
                        <Link to={"/showExperiment"} className={"btn btn-primary"}
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back to
                            experiment</Link>
                    </div>
                    <div id="treeWrapper" style={{width: '100em', height: '250em'}}>
                        <Tree data={this.props.tree} orientation={'vertical'} separation={{siblings: 2, nonSiblings: 2}}
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

export default connect(mapStateToProps, {getExperimentById})(ShowTree);
