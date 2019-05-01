import axios from "axios";

import {ADD_EXPERIMENTS, DELETE_EXPERIMENTS, GET_ERRORS, GET_EXPERIMENTS} from "./types";

// GET EXPERIMENTS
export const getExperiments = () => dispatch => {
    axios.get('/api/experiment')
        .then(res => {
            dispatch({
                type: GET_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => console.log(err))
};

// DELETE EXPERIMENT
export const deleteExperiment = id => dispatch => {
    axios.delete(`/api/experiment/${id}`)
        .then(res => {
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
            dispatch({
                type: ADD_EXPERIMENTS,
                payload: res.data
            });
        })
        .catch(err => {
            const errors = {
                msg: err.response.data,
                status: err.response.status
            };
            dispatch({
                type: GET_ERRORS,
                payload: errors
            });
        })
};