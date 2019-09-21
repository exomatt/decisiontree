import {
    ADD_EXPERIMENTS,
    DELETE_EXPERIMENTS,
    GET_EXPERIMENT_ID,
    GET_EXPERIMENTS,
    GET_TREE_BY_NUMBER,
    CANCEL_TASK, PROGRESS_EXPERIMENT, CHANGE_EXPERIMENT_NAME, SHARE_EXPERIMENT
} from "../actions/types";

const initialState = {
    experiments: [],
    experiment: {},
    tree: [],
    file: {},
    redirectMe: false,
    progress: {
        "progress_percent": 0,
        "time": 0
    },
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_EXPERIMENTS:
            return {
                ...state,
                experiments: action.payload
            };
        case GET_EXPERIMENT_ID:
            return {
                ...state,
                experiment: action.payload
            };
        case DELETE_EXPERIMENTS:
            return {
                ...state,
                experiments: state.experiments.filter(experiment => experiment.id !== action.payload)
            };
        case ADD_EXPERIMENTS:
            return {
                ...state,
                experiments: [...state.experiments, action.payload]
            };
        case GET_TREE_BY_NUMBER:
            return {
                ...state,
                tree: [...state.tree, action.payload]
            };
        case CHANGE_EXPERIMENT_NAME:
            return {
                ...state
            };
        case SHARE_EXPERIMENT:
            return {
                ...state
            };
        case CANCEL_TASK:
            return {
                ...state,
                redirectMe: true
            };
        case PROGRESS_EXPERIMENT:
            return {
                ...state,
                progress: action.payload
            };
        default:
            return state;
    }
}