import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* usersSaga() {
    yield takeLatest([
        ActionTypes.GET_ESTATE_DATA,
        ActionTypes.LOAD_POS,
        ActionTypes.LOAD_LOT_RAW_DATA,
        ActionTypes.LOAD_LOT_SETTINGS,
        ActionTypes.SAVE_LOT_RAW_DATA
    ], sendAPIRequest);
}

export default usersSaga;