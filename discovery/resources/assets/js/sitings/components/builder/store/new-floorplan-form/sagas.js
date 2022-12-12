import {takeEvery} from 'redux-saga/effects';
import {sendAPIRequest} from '~sitings~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield takeEvery([
        ActionTypes.EDIT_FLOORPLAN_FORM
    ], sendAPIRequest);
}

export default saga;