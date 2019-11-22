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
import Footer from "./layout/Footer";
import Home from "./layout/Home";
import "./layout/index.css"
import PropTypes from "prop-types";

const alertOptions = {
    timeout: 3000,
    position: 'top right'
};

class App extends Component {
    componentDidMount() {
        // setTimeout( function(){
        store.dispatch(loadUser());
        // }, 500);
    }

    render() {
        return (
            <Provider store={store}>
                <AlertProvider template={AlertTemplate} {...alertOptions}>
                    <Router>
                        <Fragment>
                            <div className="application">
                                <Header/>
                                <Alerts/>
                                <div>
                                    <div style={{minHeight: '700px'}} className="container">
                                        <Switch>
                                            <Route exact path="/" component={Home}/>
                                            <PrivateRoute exact path="/experiments" component={Experiments}/>
                                            <PrivateRoute exact path="/newExperiment" component={FormExperiment}/>
                                            <PrivateRoute exact path="/files" component={UserFiles}/>
                                            <Route exact path="/register" component={Register}/>
                                            <Route exact path="/login" component={Login}/>
                                            <PrivateRoute exact path="/showExperiment/:id"
                                                          component={ExperimentDetails}/>
                                            <PrivateRoute exact path="/showTree" component={ShowTree}/>
                                            <PrivateRoute exact path="/createConfigFile" component={FormConfigFile}/>
                                        </Switch>
                                        {/*<Experiments/>*/}
                                    </div>
                                </div>
                                <Footer/>
                            </div>
                        </Fragment>
                    </Router>
                </AlertProvider>
            </Provider>
        )


    }
}

ReactDOM.render(<App/>, document.getElementById('app'));