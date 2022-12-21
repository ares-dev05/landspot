import {takeLatest/*, takeEvery*/} from 'redux-saga/dist/redux-saga-effects-npm-proxy.esm';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~sitings~/axios/api';

function* saga() {
    yield takeLatest([
        ActionTypes.GET_SVG,
    ], sendAPIRequest);
}

export default saga;