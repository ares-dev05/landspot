import {endPoint} from './chat';
export const GET_DIRECTORY = 'GET_DIRECTORY';
export const GET_OBJECT_CONTACTS = 'GET_OBJECT_CONTACTS';
export const RESET_DIRECTORY = 'RESET_DIRECTORY';

export const getDirectory = (query) => {
    return {
        delay: 1000,
        type: GET_DIRECTORY,
        payload: {
            url: `${endPoint}/list-user-directory`,
            query
        }
    };
};

export const getUserContactsInObject = (query) => {
    return {
        type: GET_OBJECT_CONTACTS,
        payload: {
            url: `${endPoint}/list-user-object-contacts`,
            query
        }
    };
};

export const resetDirectory = () => {
    return {
        type: RESET_DIRECTORY
    };
};