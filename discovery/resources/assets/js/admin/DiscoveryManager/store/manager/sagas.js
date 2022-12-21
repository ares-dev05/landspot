import {takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* projectSaga() {

    yield takeLatest([
            ActionTypes.REMOVE_HOUSE,
            ActionTypes.REMOVE_RANGE,
            ActionTypes.UPDATE_HOUSE_DISCOVERY,
        ], sendAPIRequest
    );

    yield throttle(2000, ActionTypes.GET_HOUSES, sendAPIRequest);
}

export default projectSaga;