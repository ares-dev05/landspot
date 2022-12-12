import {error} from '~/axios/api';

const initialState = {
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case error('FETCH_DATA'):
            return Object.assign({}, state, {
                error: action.payload.error
            });

        default:
            return state;
    }
};