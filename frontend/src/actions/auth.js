import axios from "axios";
import {returnErrors} from "./messages";

import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_FAIL,
    LOGIN_SUCCESS,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_GROUP
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
// CHECK TOKEN & LOAD USER
export const loadUser = () => (dispatch, getState) => {
    // User Loading
    dispatch({type: USER_LOADING});

    axios.get('api/auth/user', tokenConfig(getState))
        .then(res => {
            dispatch({
                type: USER_LOADED,
                payload: res.data
            });
        }).catch(err => {
        dispatch(returnErrors(err.response.data, err.response.status));
        dispatch({
            type: AUTH_ERROR
        });
    });
};

// GET USER GROUP
export const loadUserGroup = () => (dispatch, getState) => {
    axios.post('api/auth/user', {}, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: USER_GROUP,
                payload: res.data
            });
        }).catch(err => {
        dispatch(returnErrors(err.response.data, err.response.status));
        dispatch({
            type: AUTH_ERROR
        });
    });
};

// LOGIN USER
export const login = (username, password) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Request Body
    const body = JSON.stringify({username, password});

    axios.post('api/auth/login', body, config)
        .then(res => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            });
            localStorage.setItem('token', res.data.token);
        }).catch(err => {
        dispatch(returnErrors(err.response.data, err.response.status));
        dispatch({
            type: LOGIN_FAIL
        });
    });
};

// LOGOUT USER
export const logout = () => (dispatch, getState) => {
    axios.post('api/auth/logout', null, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: LOGOUT_SUCCESS,
                payload: res.data
            });
            localStorage.removeItem('token');
        }).catch(err => {
        dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// REGISTER USER
export const register = ({username, password, email}) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Request Body
    const body = JSON.stringify({username, password, email});

    axios.post('api/auth/register', body, config)
        .then(res => {
            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            });
            localStorage.setItem('token', res.data.token);
        }).catch(err => {
        dispatch(returnErrors(err.response.data, err.response.status));
        dispatch({
            type: REGISTER_FAIL
        });
    });
};

//Setup config with token
export const tokenConfig = getState => {
    //Get token from state
    const token = getState().auth.token;

    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // If token, add to headers config
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
};


export const checkAuthority = () => {
    // console.log(localStorage.getItem('token'));
    return localStorage.getItem('token') ? true : false;
}