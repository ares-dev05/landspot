import * as actions from './actions';
import {success, error} from '~blog~/axios/api';

const initialState = {
    posts: [],
    topics: [],
    post: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_POSTS):
        case success(actions.GET_POST): {
            return {...state, ...action.payload.data};
        }

        case error(actions.GET_POSTS): {
            return Object.assign({}, state, {
                errors: action.payload.error.response.data.errors || action.payload.error.response.data.message
            });
        }

        case actions.RESET_POSTS_STORE: {
            return {...state, posts: [], topics: []};
        }

        case actions.RESET_POST_STORE: {
            return {...state, post: {}};
        }

        default:
            return state;
    }
};