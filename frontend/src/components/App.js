import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route, Switch} from "react-router-dom";


import Header from "./layout/Header";
import Experiments from "./experiments/Experiments";

import {Provider as AlertProvider} from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import {Provider} from "react-redux";
import store from "../store";
import FormExperiment from "./experiments/FormExperiment";
import Alerts from "./layout/Alerts";
import Login from "./accounts/Login";
import Register from "./accounts/Register";
import PrivateRoute from "./common/PrivateRoute";
import {loadUser} from "../actions/auth";
import UserFiles from "./files/UserFiles";
import ExperimentDetails from "./experiments/ExperimentDetails";
import ShowTree from "./experiments/ShowTree";
import FormConfigFile from "./files/FormConfigFile";

const alertOptions = {
    timeout: 3000,
    position: 'top right'
};

class App extends Component {
    componentDidMount() {
        store.dispatch(loadUser());
    }

    render() {
        return (
            <Provider store={store}>
                <AlertProvider template={AlertTemplate} {...alertOptions}>
                    <Router>
                        <Fragment>
                            <Header/>
                            <Alerts/>
                            <div className="container">
                                <Switch>
                                    <PrivateRoute exact path="/" component={Experiments}/>
                                    <PrivateRoute exact path="/newExperiment" component={FormExperiment}/>
                                    <PrivateRoute exact path="/files" component={UserFiles}/>
                                    <Route exact path="/register" component={Register}/>
                                    <Route exact path="/login" component={Login}/>
                                    <PrivateRoute exact path="/showExperiment" component={ExperimentDetails}/>
                                    <PrivateRoute exact path="/showTree" component={ShowTree}/>
                                    <PrivateRoute exact path="/createConfigFile" component={FormConfigFile}/>
                                </Switch>
                                {/*<Experiments/>*/}
                            </div>
                        </Fragment>
                    </Router>
                </AlertProvider>
            </Provider>
        )


    }
}

ReactDOM.render(<App/>, document.getElementById('app'));