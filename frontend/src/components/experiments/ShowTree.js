import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Tree from 'react-d3-tree';
import {Link} from "react-router-dom";
import {getExperimentById} from "../../actions/experiments";
import domtoimage from 'dom-to-image';
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import htmlToImage from 'html-to-image';
import download from 'downloadjs'

class ShowTree extends Component {
    static propTypes = {
        tree: PropTypes.array.isRequired,
        getExperimentById: PropTypes.func.isRequired,
        experiment: PropTypes.object.isRequired,
    };

    state = {
        screenCapture: '',
        key: 0
    };

    saveTree = () => {
        // var style = window.getComputedStyle(treeWrapper);
        const elementById = document.getElementById('treeWrapper');
        htmlToImage.toPng(document.getElementById('treeWrapper'), {
            style: {
                linkBase: {fill: "none", stroke: "#000"}
            }
        })
            .then(function (dataUrl) {
                download(dataUrl, 'my-node.png');
            });
        // const input = document.getElementById('treeWrapper');
        //     html2canvas(input)
        //         .then((canvas) => {
        //             const imgData = canvas.toDataURL('image/png');
        //             // const pdf = new jsPDF();
        //             // pdf.addImage(imgData, 'PNG', 0, 0);
        //             // pdf.save("download.pdf");
        //             var blob = new Blob([imgData], {type: "image/png"});
        //
        //             const url = window.URL.createObjectURL(blob);
        //
        //
        //             const link = document.createElement('a');
        //             link.href = url;
        //             link.setAttribute('download', "tree.png"); //or any other extension
        //             document.body.appendChild(link);
        //             link.click();
        //         })
        //
    };

    // saveTree = () => {
    //     this.setState({key: Math.random()});
    //     console.log(this.state);
    //     setTimeout(function () {
    //         var elementById = document.getElementById('treeWrapper');
    //         var style = window.getComputedStyle(elementById);
    //         console.log(style)
    //         domtoimage.toJpeg(elementById, {style: style}
    //             .then(function (dataUrl) {
    //                 var link = document.createElement('a');
    //                 link.download = 'my-image-name.jpeg';
    //                 link.href = dataUrl;
    //                 link.click();
    //             }));
    //     }, 2000);
    //
    // };

    // saveTree = () => {
    //     this.setState({key: Math.random()});
    //     console.log(this.state);
    //     //
    //     // const pdf = new jsPDF();
    //     // setTimeout(function () {
    //     //     var elementById = document.getElementById('treeWrapper');
    //     //     html2canvas(elementById).then((canvas) => {
    //     //         let imgData = canvas.toDataURL('image/png');
    //     //         console.log(imgData);
    //     //         pdf.addImage(imgData, 'PNG', 10, 10);
    //     //
    //     //     }).then(() => {
    //     //         pdf.save();
    //     //     });
    //     // }, 2000);
    //     setTimeout(function () {
    //         html2canvas(document.getElementById("treeWrapper"), {
    //             onrendered: function (canvas) {
    //                 var tempcanvas = document.createElement('canvas');
    //                 tempcanvas.width = 465;
    //                 tempcanvas.height = 524;
    //                 var context = tempcanvas.getContext('2d');
    //                 context.drawImage(canvas, 465, 40, 465, 524, 0, 0, 465, 524);
    //                 var link = document.createElement("a");
    //                 link.href = canvas.toDataURL('image/jpg');
    //                 link.download = 'screenshot.jpg';
    //                 link.click();
    //             }
    //         });
    //     }, 2000);
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
                              onClick={this.props.getExperimentById.bind(this, this.props.experiment.id)}>Back to
                            experiment</Link>
                        <button type="button"
                                className="btn btn-primary"
                                onClick={this.saveTree}>
                            Capture tree
                        </button>
                    </div>
                    <div id="treeWrapper" style={{width: '100em', height: '50em'}}>
                        <Tree data={this.props.tree} orientation={'vertical'} key={this.state.key}
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
