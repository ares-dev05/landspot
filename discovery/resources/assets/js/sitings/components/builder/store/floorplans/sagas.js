import {takeLatest/*, takeEvery*/} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~sitings~/axios/api';

function* saga() {
    yield takeLatest([
        ActionTypes.GET_FLOORPLANS,
        ActionTypes.UPDATE_FLOORPLAN,
    ], sendAPIRequest);
}

export default saga;