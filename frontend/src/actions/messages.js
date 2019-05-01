import {CREATE_MESSAGES} from "./types";

// CREATE MESSAGE

export const createMessage = msg => {
    return {
        type: CREATE_MESSAGES,
        payload: msg
    };
};