import {combineReducers} from "redux";
import experiments from "./experiments";
import errors from "./errors";
import messages from "./messages";
import auth from "./auth";
import files from "./files";

export default combineReducers({
    experiments,
    errors,
    messages,
    auth,
    files
});