// import {success} from "~sitings~/axios/api";

const initialState = {
    message: null
};
export default (state = initialState, action) => {
    switch (action.type) {

        case 'RESET_MESSAGE':
            return initialState;

        default:
            return state;
    }
};