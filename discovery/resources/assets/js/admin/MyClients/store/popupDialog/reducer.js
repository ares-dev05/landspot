import {success, error} from '~/axios/api';
import * as actions from './actions';
import {errorExtractor} from '~/helpers';

const initialState = {
    shortLists: [],
    loading: false,
    documents: [],
    errors: [],
    managers: null,
    sitings: [],
    legacySitings: [],
    newSiting: null,
    accepted_brief: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case actions.GET_SHORT_LISTS:
        case actions.UPLOAD_DOCUMENT:
        case actions.UPDATE_MY_CLIENT:
        case actions.UPDATE_SHORT_LIST:
        case actions.DELETE_POPUP_SITING:
        case actions.CLONE_EXISTING_POPUP_SITING:
        case actions.DELETE_INVITED_USER_SITING:
        case actions.GET_MY_SITINGS:
        case actions.GET_LEGACY_SITINGS:
        case actions.GET_AVAILABLE_MANAGERS:
        case actions.SHARE_BUYER_CREDENTIALS:
        case actions.IMPORT_SITING:
        case actions.GET_INVITED_USER_DETAILS:
        case actions.SHARE_DRAFT_SITING:
        case actions.GET_DRAFT_SITING_MANAGERS:
        case actions.UPDATE_USER_DETAILS:
            return {...state, loading: true};
        case success(actions.GET_SHORT_LISTS):
        case success(actions.GET_MY_SITINGS):
        case success(actions.GET_LEGACY_SITINGS):
        case success(actions.DELETE_INVITED_USER_SITING):
        case success(actions.SHARE_DRAFT_SITING):
        case success(actions.GET_DRAFT_SITING_MANAGERS):
        case success(actions.GET_AVAILABLE_MANAGERS):
        case success(actions.SHARE_BUYER_CREDENTIALS):
        case success(actions.IMPORT_SITING):
        case success(actions.CLONE_EXISTING_POPUP_SITING):
        case success(actions.GET_INVITED_USER_DETAILS):
        case success(actions.UPLOAD_DOCUMENT):
            return {...state, ...action.payload.data, loading: false};
        case success(actions.UPDATE_MY_CLIENT):
        case success(actions.UPDATE_SHORT_LIST):
        case success(actions.DELETE_POPUP_SITING):
        case success(actions.UPDATE_USER_DETAILS):
            return {
                ...state,
                ...action.payload.data,
                loading: false,
                updated: true
            };

        case error(actions.GET_SHORT_LISTS):
        case error(actions.DELETE_INVITED_USER_SITING):
        case error(actions.UPLOAD_DOCUMENT):
        case error(actions.UPDATE_MY_CLIENT):
        case error(actions.GET_MY_SITINGS):
        case error(actions.GET_LEGACY_SITINGS):
        case error(actions.SHARE_DRAFT_SITING):
        case error(actions.GET_INVITED_USER_DETAILS):
        case error(actions.GET_DRAFT_SITING_MANAGERS):
        case error(actions.GET_AVAILABLE_MANAGERS):
        case error(actions.DELETE_POPUP_SITING):
        case error(actions.CLONE_EXISTING_POPUP_SITING):
        case error(actions.SHARE_BUYER_CREDENTIALS):
        case error(actions.UPDATE_USER_DETAILS):
        case error(actions.IMPORT_SITING):
        case error(actions.UPDATE_SHORT_LIST): {
            return {
                ...state,
                errors: errorExtractor(action),
                loading: false
            };
        }

        case 'RESET_POPUP_UPDATE_FLAG': {
            return {
                ...state,
                updated: false
            };
        }

        case 'RESET_POPUP_MESSAGES': {
            const newState = {...state, errors: []};
            delete newState['message'];
            return newState;
        }

        case actions.VIEW_DOCUMENT: {
            return {
                ...state,
                documents: state.documents.map(
                    document => document.id === action.payload.documentId
                        ? {...document, open_count: document.open_count + 1}
                        : document
                )
            };
        }

        case actions.RESET_DIALOG_STORE:
            return initialState;
        default:
            return state;
    }
};
