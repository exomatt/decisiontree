import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {addExperiment} from "../../actions/experiments";
import {getFiles} from "../../actions/files";
import "./index.css"

class FormExperiment extends Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        addExperiment: PropTypes.func.isRequired
    };
    state = {
        name: '',
        description: '',
        config_file_name: '',
        data_file_name: '',
        test_file_name: '',
        names_file_name: ""
    };
    onChange = e => this.setState({[e.target.name]: e.target.value});

    onSubmit = e => {
        e.preventDefault();
        const {name, description, config_file_name, data_file_name, test_file_name, names_file_name} = this.state;
        const experiment = {name, description, config_file_name, data_file_name, test_file_name, names_file_name};
        console.log(experiment);
        this.props.addExperiment(experiment);
        this.setState({
            name: "",
            description: "",
            config_file_name: "",
            data_file_name: "",
            test_file_name: "",
            names_file_name: ""
        })
    };

    componentDidMount() {
        this.props.getFiles();
    };

    render() {
        const {name, description, config_file_name, data_file_name, test_file_name, names_file_name} = this.state;
        let xml_files = this.props.files.filter(file => file.endsWith(".xml"));
        let data_files = this.props.files.filter(file => file.endsWith(".data"));
        let names_files = this.props.files.filter(file => file.endsWith(".names"));
        let test_files = this.props.files.filter(file => file.endsWith(".test"));
        let optionItemsXml = xml_files.map((file) =>
            <option key={file}>{file}</option>
        );
        let optionItemsData = data_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 5)}>{file}</option>
        );
        let optionItemsNames = names_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 6)}>{file}</option>
        );
        let optionItemsTest = test_files.map((file) =>
            <option key={file} value={file.substring(0, file.length - 5)}>{file}</option>
        );
        return (
            <div className="formExperimentCard card border-light mb-3  shadow p-3 mb-5 bg-white rounded">
                <form onSubmit={this.onSubmit}>
                    <fieldset>
                        <div className="form-group">
                            <label>Experiment name</label>
                            <input type="text"
                                   className="form-control"
                                   name="name"
                                   value={name}
                                   placeholder="Enter name"
                                   onChange={this.onChange}/>

                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea className="form-control"
                                      name="description"
                                      value={description}
                                      rows="3" cols="3"
                                      id="textAreaFormExperiment"
                                      onChange={this.onChange}/>
                        </div>
                        <div className="form-group">
                            <label>Config file</label>
                            <select className="form-control"
                                    name="config_file_name"
                                    value={config_file_name}
                                    onChange={this.onChange}>
                                <option value="select">Select an Option</option>
                                {optionItemsXml}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Data file</label>
                            <select className="form-control"
                                    name="data_file_name"
                                    value={data_file_name}
                                    onChange={this.onChange}>
                                <option value="select">Select an Option</option>
                                {optionItemsData}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Test file</label>
                            <select className="form-control"
                                    name="test_file_name"
                                    value={test_file_name}
                                    onChange={this.onChange}>
                                <option value="select">Select an Option</option>
                                {optionItemsTest}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Names file</label>
                            <select className="form-control"
                                    name="names_file_name"
                                    value={names_file_name}
                                    onChange={this.onChange}>
                                <option value="select">Select an Option</option>
                                {optionItemsNames}
                            </select>
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

export default connect(mapStateToProps, {getFiles, addExperiment})(FormExperiment);