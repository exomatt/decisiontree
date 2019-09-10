import {ADD_FILES, DELETE_FILES, GET_FILES, CREATE_CONFIG_FILE} from "../actions/types";

const initialState = {
    files: []
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_FILES:
            return {
                ...state,
                files: action.payload
            };
        case DELETE_FILES:
            return {
                ...state,
                files: state.files.filter(file => file !== action.payload)
            };
        case ADD_FILES:
            return {
                ...state,
                files: [...state.files, action.payload]
            };
        case CREATE_CONFIG_FILE:
            return {
                ...state,
                files: [...state.files, action.payload]
            };
        default:
            return state;
    }
}