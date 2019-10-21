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

    state = {
        screenCapture: ''
    };

    // createPdf = (html) => Doc.createPdf(html);
    //
    // saveTree = () => {
    //     htmlToImage.toPng(document.getElementById('treeWrapper'))
    //         .then(function (dataUrl) {
    //             download(dataUrl, 'my-node.png');
    //         });
    //     // const input = document.getElementById('treeWrapper');
    //     //     html2canvas(input)
    //     //         .then((canvas) => {
    //     //             const imgData = canvas.toDataURL('image/png');
    //     //             // const pdf = new jsPDF();
    //     //             // pdf.addImage(imgData, 'PNG', 0, 0);
    //     //             // pdf.save("download.pdf");
    //     //             var blob = new Blob([imgData], {type: "image/png"});
    //     //
    //     //             const url = window.URL.createObjectURL(blob);
    //     //
    //     //
    //     //             const link = document.createElement('a');
    //     //             link.href = url;
    //     //             link.setAttribute('download', "tree.png"); //or any other extension
    //     //             document.body.appendChild(link);
    //     //             link.click();
    //     //         })
    //     //
    // };

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
                        <Link to={`/showExperiment/${this.props.experiment.id}`} className={"btn btn-primary"}
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back
                            to
                            experiment</Link>
                    </div>
                    <div id="treeWrapper" style={{width: '100em', height: '150em'}}>
                        <Tree data={this.props.tree} orientation={'vertical'}
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
