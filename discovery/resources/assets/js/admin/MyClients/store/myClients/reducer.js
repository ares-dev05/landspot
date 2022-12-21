import * as managerActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    clients: null,
    estates: [],
    houses: [],
    loading: false,
    deleted: false,
    company: {},
    errors: [],
    updated: false,
    is_brief_admin: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case managerActions.REJECT_BRIEF_CLIENT: {
            const newClients = state.clients && state.clients.data
                ? state.clients.data.filter(client => {
                    const rejectBriefId = action.payload.data.brief_id;
                    const brief = client.brief ? client.brief : null;
                    return brief ? (brief.id !== rejectBriefId) : client;
                })
                : null;
            return {
                ...state,
                clients: newClients
            };
        }
        case managerActions.DELETE_SITING:
        case managerActions.DELETE_MY_CLIENT:
        case managerActions.CLONE_EXISTING_SITING:
        case managerActions.GET_MY_CLIENTS:
        case managerActions.SEND_INVITE:
            return {...state, loading: true};
        case managerActions.ACCEPT_BRIEF_CLIENT:
        case success(managerActions.GET_MY_CLIENTS):
            return {...state, ...action.payload.data, loading: false};
        case success(managerActions.SEND_INVITE): {
            const newClients = state.clients && state.clients.data
                ? state.clients.data.some(client => client.id === action.payload.data.id)
                    ? state.clients.data.map(client => {
                        const newUser = action.payload.data;
                        if (client.id == newUser.id) {
                            return newUser;
                        }
                        return client;
                    })
                    : [
                        action.payload.data,
                        ...state.clients
                    ]
                : null;
            return {
                ...state,
                clients: newClients,
                loading: false,
                updated: true
            };
        }
        case success(managerActions.DELETE_SITING):
        case success(managerActions.DELETE_MY_CLIENT):
        case success(managerActions.CLONE_EXISTING_SITING):
            return {
                ...state,
                ...action.payload.data,
                loading: false,
                deleted: true
            };
        case error(managerActions.GET_MY_CLIENTS):
        case error(managerActions.SEND_INVITE):
        case error(managerActions.CLONE_EXISTING_SITING):
        case error(managerActions.DELETE_MY_CLIENT):
        case error(managerActions.DELETE_SITING):
        case error(managerActions.ACCEPT_BRIEF_CLIENT):
        case error(managerActions.REJECT_BRIEF_CLIENT): {
            return {
                ...state,
                errors: errorExtractor(action),
                loading: false
            };
        }
        case 'RESET_POPUP_DELETE_FLAG':
            return {...state, deleted: false};
        case managerActions.RESET_MY_CLIENTS_MESSAGES: {
            const newState = {...state, errors: [], updated: false};
            delete newState['message'];
            return newState;
        }
        default: {
            return state;
        }
    }
};
