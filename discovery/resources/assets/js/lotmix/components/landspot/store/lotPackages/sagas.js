import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield takeLatest(ActionTypes.LOAD_LOT_PACKAGES_FOR_VIEW, sendAPIRequest);
}

export default saga;