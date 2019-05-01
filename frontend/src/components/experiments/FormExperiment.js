import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {addExperiment} from "../../actions/experiments";

class FormExperiment extends Component {
    static propTypes = {
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


    render() {
        const {name, description, config_file_name, data_file_name} = this.state;
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
                                <option>test1</option>
                                <option>test2</option>
                                <option>test3</option>
                                <option>test4</option>
                                <option>test5</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Data fiels</label>
                            <select className="form-control"
                                    name="data_file_name"
                                    value={data_file_name}
                                    onChange={this.onChange}>
                                <option value="select">Select an Option</option>
                                <option>test1</option>
                                <option>test2</option>
                                <option>test3</option>
                                <option>test4</option>
                                <option>test5</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary">Submit</button>
                    </fieldset>
                </form>
            </div>
        );
    }
}

export default connect(null, {addExperiment})(FormExperiment);