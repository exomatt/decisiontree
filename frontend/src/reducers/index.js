import {combineReducers} from "redux";
import experiments from "./experiments";
import errors from "./errors";

export default combineReducers({
    experiments,
    errors
});