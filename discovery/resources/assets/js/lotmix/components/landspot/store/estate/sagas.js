import {takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* estateSaga() {
    yield throttle(2000, ActionTypes.GET_ESTATE_LOTS, sendAPIRequest);

    yield takeLatest([
            ActionTypes.SWITCH_LOT_TO_SHORTLIST,
        ], sendAPIRequest
    );
}

export default estateSaga;