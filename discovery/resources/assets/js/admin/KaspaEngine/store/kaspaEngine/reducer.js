import * as managerActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    estates: [],
    formulas: [],
    addedRules: [],
    loading: false,
    errors: [],
    message: ''
};

export default (state = initialState, action) => {
    switch (action.type) {
        case managerActions.GET_ESTATES:
        case managerActions.ADD_NEW_RULES_TO_ENTITY:
        case managerActions.REMOVE_RULE_FROM_ENTITY:
        case managerActions.GET_LAST_SELECTED_FORMULAS:
        case managerActions.GET_FORMULAS:
        case managerActions.DELETE_STAGE_PACKAGE:
        case managerActions.UPDATE_STAGE_PACKAGE:
            return {...state, loading: true, message: ''};
        case success(managerActions.GET_ESTATES):
        case success(managerActions.ADD_NEW_RULES_TO_ENTITY):
        case success(managerActions.REMOVE_RULE_FROM_ENTITY):
        case success(managerActions.GET_LAST_SELECTED_FORMULAS):
        case success(managerActions.GET_FORMULAS):
        case success(managerActions.DELETE_STAGE_PACKAGE):
        case success(managerActions.UPDATE_STAGE_PACKAGE):
            return {...state, ...action.payload.data, loading: false};
        case error(managerActions.GET_FORMULAS):
        case error(managerActions.GET_LAST_SELECTED_FORMULAS):
        case error(managerActions.ADD_NEW_RULES_TO_ENTITY):
        case error(managerActions.REMOVE_RULE_FROM_ENTITY):
        case error(managerActions.GET_ESTATES):
        case error(managerActions.DELETE_STAGE_PACKAGE):
        case error(managerActions.UPDATE_STAGE_PACKAGE): {
            return {
                ...state,
                errors: errorExtractor(action),
                loading: false
            };
        }

        case managerActions.RESET_USER_MESSAGES: {
            return {...state, message: '', errors: []};
        }

        default: {
            return state;
        }
    }
};
