import {APIAction} from '~/axios/api';

export const GET_MY_CLIENTS = 'GET_MY_CLIENTS';
export const getMyClients = query => {
    const url = '/landspot/my-clients';
    return APIAction(GET_MY_CLIENTS, 'get', url, null, null, query);
};

export const DELETE_MY_CLIENT = 'DELETE_MY_CLIENT';
export const deleteMyClient = urlParams => {
    const url = '/landspot/my-clients/:id';
    return APIAction(DELETE_MY_CLIENT, 'delete', url, null, urlParams);
};
export const DELETE_SITING = 'DELETE_SITING';
export const deleteSiting = urlParams => {
    const url = '/landspot/my-sitings/:id';
    return APIAction(DELETE_SITING, 'delete', url, null, urlParams);
};

export const CLONE_EXISTING_SITING = 'CLONE_EXISTING_SITING';
export const cloneExistingSiting = (urlParams) => {
    const url = '/landspot/my-clients/clone-siting/:id';
    return APIAction(CLONE_EXISTING_SITING, 'post', url, null, urlParams);
};

export const SEND_INVITE = 'SEND_INVITE';
export const sendInvite = data => {
    const url = '/landspot/my-clients';
    return APIAction(SEND_INVITE, 'post', url, data);
};

export const RESET_MY_CLIENTS_MESSAGES = 'RESET_MY_CLIENTS_MESSAGES';
export const resetMyClientsMessages = () => {
    return {type: RESET_MY_CLIENTS_MESSAGES};
};

export const ACCEPT_BRIEF_CLIENT = 'ACCEPT_BRIEF_CLIENT';
export const acceptBriefClient = data => {
    const url = '/landspot/my-clients/brief/action';
    return APIAction(ACCEPT_BRIEF_CLIENT, 'post', url, data);
};

export const REJECT_BRIEF_CLIENT = 'REJECT_BRIEF_CLIENT';
export const rejectBriefClient = data => {
    const url = '/landspot/my-clients/brief/action';
    return APIAction(REJECT_BRIEF_CLIENT, 'post', url, data);
};