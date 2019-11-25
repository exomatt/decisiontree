import React, {Component, Fragment} from 'react';
import {withAlert} from "react-alert";
import PropTypes from "prop-types";
import {connect} from "react-redux";


class Alerts extends Component {
    static propTypes = {
        error: PropTypes.object.isRequired,
        message: PropTypes.object.isRequired
    };

    componentDidUpdate(prevProps) {
        const {error, alert, message} = this.props;
        if (error !== prevProps.error) {
            if (error.msg.name)
                alert.error(`Name: ${error.msg.name.join()}`);
            if (error.msg.description)
                alert.error(`Description: ${error.msg.description.join()}`);
            if (error.msg.config_file_name)
                alert.error(`Config file: ${error.msg.config_file_name.join()}`);
            if (error.msg.data_file_name)
                alert.error(`Data file: ${error.msg.data_file_name.join()}`);
            if (error.msg.non_field_errors)
                alert.error(`${error.msg.non_field_errors.join()}`);
            if (error.msg.username)
                alert.error(`${error.msg.username.join()}`);
            // if (error.msg){
            //     console.log(error.msg)
            //     if (error.msg.detail === "Authentication credentials were not provided"){
            //         return
            //     }
            //     alert.error(`${error.msg}`);
            // };
        }

        if (message !== prevProps.message) {
            if (message.deleteExperiment)
                alert.success(message.deleteExperiment);
            if (message.createExperiment)
                alert.success(message.createExperiment);
            if (message.passwordNotMatch)
                alert.error(message.passwordNotMatch);
            if (message.addFiles)
                alert.success(message.addFiles);
            if (message.deleteFiles)
                alert.success(message.deleteFiles);
            if (message.cancelTask)
                alert.success(message.cancelTask);
            if (message.createConfigFile)
                alert.success(message.createConfigFile);
            if (message.emptyField)
                alert.error(message.emptyField);
            if (message.changeExperimentCrud)
                alert.success(message.changeExperimentCrud);
            if (message.shareExperiment)
                alert.success(message.shareExperiment);
            if (message.changeName)
                alert.success(message.changeName);
            if (message.rerunTask)
                alert.success(message.rerunTask);
            if (message.startTask)
                alert.success(message.startTask);
            if (message.copyExperiment)
                alert.success(message.copyExperiment);
            if (message.shareExperimentError)
                alert.error(message.shareExperimentError);
            if (message.errorFiles)
                alert.error(message.errorFiles);
            if (message.problemExperimentID)
                alert.info(message.problemExperimentID);
        }
    }

    render() {
        return <Fragment/>;
    }
}

const mapStateToProps = state => ({
    error: state.errors,
    message: state.messages
});

export default connect(mapStateToProps)(withAlert()(Alerts));