import {combineReducers} from "redux";
import experiments from "./experiments";
import errors from "./errors";
import messages from "./messages";

export default combineReducers({
    experiments,
    errors,
    messages
});