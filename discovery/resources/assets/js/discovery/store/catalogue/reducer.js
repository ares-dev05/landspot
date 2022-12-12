import * as actions from './actions';
import {success, error} from '~/axios/api';

const basePath = window.location.pathname.match(/^(\/(?:discovery|footprints|landspot\/discovery))/);

const initialState = Object.freeze({
    houses: null,
    filters: null,
    titles: [],
    basePath: basePath !== null ? basePath[1] : ''
});

export default (state = initialState, action) => {

    switch (action.type) {
        case success(actions.FILTER_CATALOGUE): {
            return Object.assign({}, state, action.payload.data);
        }
        case error(actions.FILTER_CATALOGUE):{
            return state;
        }

        case 'RESET_CATALOGUE_STORE':
            return initialState;

        default:
            return state;
    }
};