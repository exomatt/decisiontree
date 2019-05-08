import {ADD_EXPERIMENTS, DELETE_EXPERIMENTS, GET_EXPERIMENTS} from "../actions/types";

const initialState = {
    experiments: []
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_EXPERIMENTS:
            return {
                ...state,
                experiments: action.payload
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
        default:
            return state;
    }
}