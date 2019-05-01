import axios from "axios";
import {createMessage, returnErrors} from "./messages";

import {ADD_EXPERIMENTS, DELETE_EXPERIMENTS, GET_EXPERIMENTS} from "./types";

// GET EXPERIMENTS
export const getExperiments = () => dispatch => {
    axios.get('/api/experiment')
        .then(res => {
            dispatch({
                type: GET_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};

// DELETE EXPERIMENT
export const deleteExperiment = id => dispatch => {
    axios.delete(`/api/experiment/${id}`)
        .then(res => {
            dispatch(createMessage({deleteExperiment: "Experiment Deleted"}));
            dispatch({
                type: DELETE_EXPERIMENTS,
                payload: id
            });
        })
        .catch(err => console.log(err))
};

// ADD EXPERIMENT
export const addExperiment = (experiment) => dispatch => {
    axios.post(`/api/experiment/`, experiment)
        .then(res => {
            dispatch(createMessage({createExperiment: "Experiment Created"}));
            dispatch({
                type: ADD_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};