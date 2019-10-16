import {
    ADD_EXPERIMENTS,
    CANCEL_TASK,
    CHANGE_EXPERIMENT_CRUD,
    COPY_EXPERIMENT,
    DELETE_EXPERIMENTS,
    GET_EXPERIMENT_ID,
    GET_EXPERIMENTS,
    GET_TREE_BY_NUMBER,
    PROGRESS_EXPERIMENT,
    RERUN_TASK,
    SHARE_EXPERIMENT,
    START_TASK
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
                experiments: action.payload,
                redirectMe: false
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
        case CHANGE_EXPERIMENT_CRUD:
            return {
                ...state
            };
        case SHARE_EXPERIMENT:
        case COPY_EXPERIMENT:
            return {
                ...state
            };
        case START_TASK:
        case RERUN_TASK:
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