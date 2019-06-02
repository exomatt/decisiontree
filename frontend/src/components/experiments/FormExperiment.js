import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {addExperiment} from "../../actions/experiments";
import {getFiles} from "../../actions/files";

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
        data_file_name: ''
    };
    onChange = e => this.setState({[e.target.name]: e.target.value});

    onSubmit = e => {
        e.preventDefault();
        const {name, description, config_file_name, data_file_name} = this.state;
        const experiment = {name, description, config_file_name, data_file_name};
        this.props.addExperiment(experiment);
        this.setState({
            name: "",
            description: "",
            config_file_name: "",
            data_file_name: ""
        })
    };

    componentDidMount() {
        this.props.getFiles();
    };

    render() {
        const {name, description, config_file_name, data_file_name} = this.state;
        let xml_files = this.props.files.filter(file => file.endsWith(".xml"));
        let data_files = this.props.files.filter(file => file.endsWith(".data"));
        let optionItemsXml = xml_files.map((file) =>
            <option key={file}>{file}</option>
        );
        let optionItemsData = data_files.map((file) =>
            <option key={file}>{file.substring(0, file.length - 5)}</option>
        );
        console.log(xml_files);
        console.log(data_files);
        return (
            <div className="card border-light mb-3">
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