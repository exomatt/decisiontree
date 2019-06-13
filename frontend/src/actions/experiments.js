import axios from "axios";
import {createMessage, returnErrors} from "./messages";
import {tokenConfig} from "./auth";
import {ADD_EXPERIMENTS, DELETE_EXPERIMENTS, GET_EXPERIMENT_ID, GET_EXPERIMENTS} from "./types";

// GET EXPERIMENTS
export const getExperiments = () => (dispatch, getState) => {
    axios.get('/api/experiment', tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};

// GET EXPERIMENT WITH ID
export const getExperimentById = id => (dispatch, getState) => {
    axios.get(`/api/experiment/${id}`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_EXPERIMENT_ID,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};

// DELETE EXPERIMENT
export const deleteExperiment = id => (dispatch, getState) => {
    axios.delete(`/api/experiment/${id}`, tokenConfig(getState))
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
export const addExperiment = (experiment) => (dispatch, getState) => {
    axios.post(`/api/experiment/`, experiment, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({createExperiment: "Experiment Created"}));
            dispatch({
                type: ADD_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};