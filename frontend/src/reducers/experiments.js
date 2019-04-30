import {GET_EXPERIMENTS} from "../actions/types.js";
import {DELETE_EXPERIMENTS} from "../actions/types";

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
        default:
            return state;
    }
}