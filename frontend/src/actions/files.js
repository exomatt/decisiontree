import axios from "axios";
import {createMessage, returnErrors} from "./messages";
import {tokenConfig} from "./auth";
import {ADD_FILES, DELETE_FILES, GET_FILES} from "./types";

// GET EXPERIMENTS
export const getFiles = () => (dispatch, getState) => {
    axios.get('api/auth/userFiles', tokenConfig(getState))
        .then(res => {
            dispatch({
                type: GET_FILES,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)))
};
// DELETE EXPERIMENT
export const deleteFiles = name => (dispatch, getState) => {
    //Get token from state
    const token = getState().auth.token;

    // Headers
    const config = {
        params: {
            'name': name
        },
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    // If token, add to headers config
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    console.log("name " + name);
    // console.log("config " + config.body.name);
    console.log("config " + config.headers.toString());
    axios.delete(`api/auth/userFiles`, config)
        .then(res => {
            dispatch(createMessage({deleteExperiment: "File Deleted"}));
            dispatch({
                type: DELETE_FILES,
                payload: name
            });
        })
        .catch(err => console.log(err))
};

// ADD EXPERIMENT
export const addFiles = (file) => (dispatch, getState) => {
    axios.put(`api/auth/userFiles`, file, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({createExperiment: "File/Files added"}));
            dispatch({
                type: ADD_FILES,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};
