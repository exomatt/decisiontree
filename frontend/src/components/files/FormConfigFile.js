import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {createConfigFile} from "../../actions/files";
import {createMessage} from "../../actions/messages";

class FormConfigFile extends Component {
    static propTypes = {
        createConfigFile: PropTypes.func.isRequired,
        createMessage: PropTypes.func.isRequired
    };
    state = {
        name: '',
        runs: '5',
        mutationomp: 'true',
        crossoveromp: 'true',
        selectionomp: 'true',
        selectiontype: 'normal',
        sizeofpopulation: '64',
        maximumiterations: '1000',
        minimumiterations: '1000',
        probabilityofmutation: '80',
        selectionpressure: '1.2',
        probabilityofcrossover: '20'
    };
    onChange = e => this.setState({[e.target.name]: e.target.value});

    onSubmit = e => {
        e.preventDefault();
        const {
            name, runs, mutationomp, crossoveromp,
            selectionomp, selectiontype, sizeofpopulation,
            maximumiterations, minimumiterations, probabilityofmutation,
            selectionpressure, probabilityofcrossover
        } = this.state;
        const configFile = {
            name, runs, mutationomp, crossoveromp,
            selectionomp, selectiontype, sizeofpopulation,
            maximumiterations, minimumiterations, probabilityofmutation,
            selectionpressure, probabilityofcrossover
        };
        for (let configFileKey in configFile) {
            if (configFile[configFileKey] === '') {
                this.props.createMessage({emptyField: 'Please fill empty fields'});
                return;
            }
        }
        this.props.createConfigFile(configFile);
        this.setState({
            name: '',
            runs: '5',
            mutationomp: 'true',
            crossoveromp: 'true',
            selectionomp: 'true',
            selectiontype: 'normal',
            sizeofpopulation: '64',
            maximumiterations: '1000',
            minimumiterations: '1000',
            probabilityofmutation: '80',
            selectionpressure: '1.2',
            probabilityofcrossover: '20'
        })
    };

    componentDidMount() {
    };

    render() {
        const {
            name, runs, mutationomp, crossoveromp,
            selectionomp, selectiontype, sizeofpopulation,
            maximumiterations, minimumiterations, probabilityofmutation,
            selectionpressure, probabilityofcrossover
        } = this.state;
        return (
            <div className="card border-light mb-3">
                <h1>Create new config file</h1>
                <form onSubmit={this.onSubmit}>
                    <fieldset>
                        <div className="form-group">
                            <label>Config file name</label>
                            <input type="text"
                                   className="form-control"
                                   name="name"
                                   value={name}
                                   placeholder="Enter name"
                                   onChange={this.onChange}/>

                        </div>
                        <div className="form-group">
                            <label>Runs of experiments</label>
                            <input type="number" className="form-control"
                                   name="runs"
                                   value={runs}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Mutation OMP</label>
                            <select className="form-control"
                                    name="mutationomp"
                                    value={mutationomp}
                                    onChange={this.onChange}>
                                <option key="true">true</option>
                                <option key="false">false</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mutation OMP</label>
                            <select className="form-control"
                                    name="crossoveromp"
                                    value={crossoveromp}
                                    onChange={this.onChange}>
                                <option key="crossoveromptrue">true</option>
                                <option key="crossoverompfalse">false</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mutation OMP</label>
                            <select className="form-control"
                                    name="selectionomp"
                                    value={selectionomp}
                                    onChange={this.onChange}>
                                <option key="selectionomptrue">true</option>
                                <option key="selectionompfalse">false</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mutation OMP</label>
                            <select className="form-control"
                                    name="selectiontype"
                                    value={selectiontype}
                                    onChange={this.onChange}>
                                <option key="selectiontypenormal">normal</option>
                                <option key="selectiontyperandom">random</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Size of population</label>
                            <input type="number" className="form-control"
                                   name="sizeofpopulation"
                                   value={sizeofpopulation}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Maximum iterations number</label>
                            <input type="number" className="form-control"
                                   name="maximumiterations"
                                   value={maximumiterations}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Minimum iterations number</label>
                            <input type="number" className="form-control"
                                   name="minimumiterations"
                                   value={minimumiterations}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Minimum iterations number</label>
                            <input type="number" className="form-control"
                                   name="minimumiterations"
                                   value={minimumiterations}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Probability of mutation </label>
                            <input type="number" className="form-control"
                                   name="probabilityofmutation"
                                   value={probabilityofmutation}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Probability of crossover</label>
                            <input type="number" className="form-control"
                                   name="probabilityofcrossover"
                                   value={probabilityofcrossover}
                                   onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Selection pressure</label>
                            <input type="number" className="form-control"
                                   name="selectionpressure"
                                   value={selectionpressure}
                                   step="0.01"
                                   onChange={this.onChange}/>
                        </div>

                        <button type="submit" className="btn btn-primary">Submit</button>
                    </fieldset>
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    files: state.files.files
});
export default connect(mapStateToProps, {createConfigFile, createMessage})(FormConfigFile);