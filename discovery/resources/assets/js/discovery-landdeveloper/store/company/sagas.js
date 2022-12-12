import {throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import {FILTER_COMPANY_HOUSES} from '../catalogue/actions';

function* companySaga() {
    yield throttle(1000, FILTER_COMPANY_HOUSES, sendAPIRequest);
}

export default companySaga;