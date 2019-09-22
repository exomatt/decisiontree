import axios from "axios";
import {createMessage, returnErrors} from "./messages";
import {tokenConfig} from "./auth";
import {ADD_FILES, CHANGE_FILE_NAME, CREATE_CONFIG_FILE, DELETE_FILES, GET_FILES} from "./types";

// GET FILES
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
// DELETE FILES
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
            dispatch(createMessage({deleteFiles: "File Deleted"}));
            dispatch({
                type: DELETE_FILES,
                payload: name
            });
        })
        .catch(err => console.log(err))
};

// ADD FILES TO EXPERIMENT
export const addFiles = (file) => (dispatch, getState) => {
    //Get token from state
    const token = getState().auth.token;

    // Headers
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    // If token, add to headers config
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    var formData = new FormData();
    file.map((file) => {
        formData.append(`file`, file);
    });
    axios.put(`api/auth/userFiles`, formData, config)
        .then(res => {
            dispatch(createMessage({addFiles: res.data}));
            dispatch({
                type: ADD_FILES,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

// CREATE NEW CONFIG FILE
export const createConfigFile = (configFile) => (dispatch, getState) => {
    axios.post(`/api/files`, configFile, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({createConfigFile: res.data}));
            dispatch({
                type: CREATE_CONFIG_FILE,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

// CHANGE FILE NAME
export const changeFileName = (object) => (dispatch, getState) => {
    axios.post(`api/auth/userFiles`, object, tokenConfig(getState))
        .then(res => {
            dispatch(createMessage({changeName: res.data}));
            dispatch({
                type: CHANGE_FILE_NAME,
                payload: res.data
            });
        })
        .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};