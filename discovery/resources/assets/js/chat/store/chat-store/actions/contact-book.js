export const GET_CONTACTS_BOOK = 'GET_CONTACTS_BOOK';
import {endPoint} from './chat';

export const getContactsBook = (query) => {
    return {
        delay: 500,
        type: GET_CONTACTS_BOOK,
        payload: {
            url: `${endPoint}/list-contacts-book`,
            query
        }
    };
};