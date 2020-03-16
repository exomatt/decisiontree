import axios from "axios";
import {createMessage, returnErrors} from "./messages";
import {logout, tokenConfig} from "./auth";
import {
    ADD_EXPERIMENTS,
    CANCEL_TASK, CHANGE_EXPERIMENT_CRUD, CHANGE_EXPERIMENT_NAME, COPY_EXPERIMENT,
    DELETE_EXPERIMENTS,
    GET_EXPERIMENT_ID, GET_EXPERIMENT_PERMISSION,
    GET_EXPERIMENTS,
    GET_TREE_BY_NUMBER,
    PROGRESS_EXPERIMENT, RERUN_TASK, SHARE_EXPERIMENT, START_TASK
} from "./types";


axios.interceptors.response.use(
    response => response,
    error => {
        if (error.request.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);
// GET EXPERIMENTS
export const getExperiments = () => (dispatch, getState) => {
    axios.get('/api/experiment/', tokenConfig(getState))
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
    axios.get(`/api/experiment/${id}/`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_EXPERIMENT_ID,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};

// GET EXPERIMENT SHARE PERMISSION BY ID
export const getExperimentPermission = id => (dispatch, getState) => {
    axios.get(`/api/share?id=${id}`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_EXPERIMENT_PERMISSION,
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

// CHANGE EXPERIMENT NAME
export const changeExperimentCrud = (body) => (dispatch, getState) => {
    axios.post(`/api/crud`, body, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({changeExperimentCrud: res.data}));
            dispatch({
                type: CHANGE_EXPERIMENT_CRUD,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

// SHARE EXPERIMENT
export const shareExperiment = (shareOptions) => (dispatch, getState) => {
    axios.post(`/api/share`, shareOptions, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({shareExperiment: res.data}));
            dispatch({
                type: SHARE_EXPERIMENT,
                payload: res.data
            });
        })
        .catch(err => {
            dispatch(createMessage({shareExperimentError: err.response.data}));
        })
};


// GET TREE BY RUN NUMBER
export const getTreeByNumber = (id, runNumber) => (dispatch, getState) => {
    axios.get(`/api/results?id=${id}&runNumber=${runNumber}`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_TREE_BY_NUMBER,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};


// PROGRESS TASK
export const getProgress = (id) => (dispatch, getState) => {
    axios.get(`/api/progress?id=${id}`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: PROGRESS_EXPERIMENT,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};


// CANCEL TASK
export const cancelTask = (id) => (dispatch, getState) => {
    axios.get(`/api/task?id=${id}`, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({cancelTask: "Experiment task canceled"}));
            dispatch({
                type: CANCEL_TASK,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};


// RERUN TASK
export const rerunTask = (id) => (dispatch, getState) => {
    axios.post(`/api/task?id=${id}`, {}, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({rerunTask: "Experiment rerun"}));
            dispatch({
                type: RERUN_TASK,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};


// START TASK
export const startTask = (id) => (dispatch, getState) => {
    axios.put(`/api/task?id=${id}`, {}, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({startTask: "Experiment start"}));
            dispatch({
                type: START_TASK,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};


// COPY EXPERIMENT
export const copyExperiment = (id) => (dispatch, getState) => {
    axios.get(`/api/copy?id=${id}`, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({copyExperiment: res.data}));
            dispatch({
                type: COPY_EXPERIMENT,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};