import React, {Component, Fragment} from 'react';
import {withAlert} from "react-alert";
import PropTypes from "prop-types";
import {connect} from "react-redux";


class Alerts extends Component {
    static propTypes = {
        error: PropTypes.object.isRequired
    };

    componentDidUpdate(prevProps) {
        const {error, alert} = this.props;
        if (error !== prevProps.error) {
            if (error.msg.name)
                alert.error(`Name: ${error.msg.name.join()}`);
            if (error.msg.description)
                alert.error(`Description: ${error.msg.description.join()}`);
            if (error.msg.config_file_name)
                alert.error(`Description: ${error.msg.config_file_name.join()}`);
            if (error.msg.data_file_name)
                alert.error(`Description: ${error.msg.data_file_name.join()}`);
        }
    }

    render() {
        return <Fragment/>;
    }
}

const mapStateToProps = state => ({
    error: state.errors
});

export default connect(mapStateToProps)(withAlert()(Alerts));