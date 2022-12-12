import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~blog~/axios/api';

function* saga() {
    yield takeLatest([ActionTypes.GET_POSTS, ActionTypes.GET_POST], sendAPIRequest);
}

export default saga;