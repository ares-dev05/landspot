import {takeEvery} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield takeEvery([
            ActionTypes.GET_SETTINGS,
            ActionTypes.UPDATE_SETTINGS,
        ], sendAPIRequest
    );
}

export default saga;