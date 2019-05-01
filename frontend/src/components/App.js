import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';


import Header from "./layout/Header";
import Experiments from "./experiments/Experiments";


import {Provider} from "react-redux";
import store from "../store";
import FormExperiment from "./experiments/FormExperiment";

const alertOptions = {
    timeout: 3000,
    position: 'top right'
};

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Fragment>
                    <Header/>
                    <div className="container">
                        <Experiments/>
                        <FormExperiment/>
                    </div>
                </Fragment>
            </Provider>
        )


    }
}

ReactDOM.render(<App/>, document.getElementById('app'));