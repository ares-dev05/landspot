import * as actions from './actions';
import {success, error} from '~sitings~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    floorplan: null,
    svgData: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_SVG): {
            return {...state, ...action.payload.data, ...{SVG_UPDATED: true}};
        }

        //eslint-disable-next-line no-fallthrough
        case error(actions.GET_SVG): {
            return {
                ...state,
                ...{
                    errors: errorExtractor(action)
                }
            };
        }

        case actions.RESET_SVG_MESSAGES :
            // eslint-disable-next-line no-case-declarations
            const newState = {...state};
            delete newState['errors'];
            return newState;

        case actions.RESET_SVG_STORE: {
            return {...state, ...initialState};
        }

        case actions.RESET_SVG_UPDATED: {
            const newState = {...state};
            delete newState['SVG_UPDATED'];
            return newState;
        }

        default:
            return state;
    }
};