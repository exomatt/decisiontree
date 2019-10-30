import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Tree from 'react-d3-tree';
import {Link} from "react-router-dom";
import {getExperimentById} from "../../actions/experiments";
import ReactToPrint from 'react-to-print';

class ShowTree extends Component {
    static propTypes = {
        tree: PropTypes.array.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        experiment: PropTypes.object.isRequired,
    };

    render() {
        if (this.props.tree.length === 0) {

            return (
                <div>
                    <div>
                        <Link to={`/showExperiment/${this.props.experiment.id}`} className={"btn btn-primary"}
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back
                            to
                            experiment</Link>
                    </div>
                </div>
            );
        } else {
            return (

                <div>

                    <div>
                        <img src={this.state.screenCapture}/>
                        <Link to={`/showExperiment/${this.props.experiment.id}`}
                              className={"btn btn-primary"}
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back
                            to
                            experiment</Link>
                    </div>
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
                    <div id="treeWrapper" style={{width: '150em', height: '50em'}}>
                        <Tree ref={el => (this.componentRef = el)} data={this.props.tree} orientation={'vertical'}
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

export default connect(mapStateToProps, {getExperimentById})(ShowTree);
