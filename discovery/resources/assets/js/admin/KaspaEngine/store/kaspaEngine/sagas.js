import {takeLatest, throttle, takeEvery} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* projectSaga() {
    yield takeLatest([
        ActionTypes.GET_ESTATES,
        ActionTypes.ADD_NEW_RULES_TO_ENTITY,
        ActionTypes.DELETE_STAGE_PACKAGE,
        ActionTypes.REMOVE_RULE_FROM_ENTITY
    ], sendAPIRequest);

    yield takeEvery([
        ActionTypes.GET_LAST_SELECTED_FORMULAS
    ], sendAPIRequest);

    yield throttle(1000, ActionTypes.GET_FORMULAS, sendAPIRequest);
}

export default projectSaga;
