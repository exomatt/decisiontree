import axios from "axios";

import {DELETE_EXPERIMENTS, GET_EXPERIMENTS} from "./types";

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