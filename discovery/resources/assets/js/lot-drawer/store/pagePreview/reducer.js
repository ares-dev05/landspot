import {success, error} from '~/axios/api';

const initialState = {
    pageId: null,
    zoom: 100,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PAGE_ID':
        case 'SET_PAGE_ZOOM':
            return Object.assign({}, state, action.payload);

        case 'RESET_PAGE_PREVIEW_STATE':
            return initialState;

        default: {
            return state;
        }
    }

};