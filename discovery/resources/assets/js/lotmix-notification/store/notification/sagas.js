import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield takeLatest([
            ActionTypes.GET_LOTMIX_NOTIFICATIONS,
            ActionTypes.CLOSE_LOTMIX_NOTIFICATION,
        ],
        sendAPIRequest
    );
}

export default saga;