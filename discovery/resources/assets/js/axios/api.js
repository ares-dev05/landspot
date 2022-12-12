import axios from 'axios';
import {put, call, delay} from 'redux-saga/effects';

export const ApiRequest = (method, url, data, urlParams, query, headers = {'Content-type': 'application/json'}) => {
    if (urlParams) {
        for (let k in urlParams) {
            if (urlParams.hasOwnProperty(k)) {
                url = url.replace(`:${k}`, encodeURIComponent(urlParams[k]));
            }
        }
    }
    if(query) {
        const queryString = require('query-string');
        if(url.lastIndexOf('?') === -1) {
            url += '?';
        }
        url += queryString.stringify(query);
    }
    return axios({
        method: method ? method : 'get',
        headers,
        url: url,
        data: data
    });
};

export function* sendAPIRequest(action) {
    if (action.delay) {
        yield delay(action.delay);
    }
    try {
        const {data} = yield call(
            ApiRequest,
            action.payload.method,
            action.payload.url,
            action.payload.data,
            action.payload.urlParams,
            action.payload.query
        );
        yield put({type: success(action.type), payload: {data}});

        if(action.onSuccess) {
            yield action.onSuccess(data);
        }
    } catch (e) {
        yield generalHttpErrorHandler(e);
        yield put({type: error(action.type), payload: {error: e}});
    }
}

const generalHttpErrorHandler = function* generalHttpErrorHandler(err) {
    const response = err.response;

    if (!response) {
        return
    }

    switch (response.status) {
        case 403:
        case 404:
        case 500:
            yield put({type: error('FETCH_DATA'), payload: {error: response.data.message}});
            break;
        default:
            yield put({type: error('FETCH_DATA'), payload: {error: 'Unexpected error'}});
            break;
    }
};

/**
 *
 * @param type Action Type
 * @param method GET,POST,...
 * @param url
 * @param data Object
 * @param urlParams Object
 * @param query Object
 * @returns Object
 */
export const APIAction = (type, method, url, data, urlParams, query) => {
    return {
        type: type,
        payload: {
            method,
            url,
            data,
            urlParams,
            query
        }
    };
};
const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';
const ABORT_SUFFIX = '_ABORT';

const getActionWithSuffix = function getActionWithSuffix(suffix) {
    return function (actionType) {
        return actionType + suffix;
    };
};

export const success = getActionWithSuffix(SUCCESS_SUFFIX);
export const error = getActionWithSuffix(ERROR_SUFFIX);
export const abort = getActionWithSuffix(ABORT_SUFFIX);