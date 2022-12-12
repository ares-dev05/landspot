import {takeLatest, throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import {FILTER_COMPANY_HOUSES} from '../catalogue/actions';
import {SWITCH_HOUSE_TO_SHORTLIST} from '~/lotmix/components/discovery/store/company/actions';

function* companySaga() {
    yield throttle(1000, FILTER_COMPANY_HOUSES, sendAPIRequest);

    yield takeLatest([
            SWITCH_HOUSE_TO_SHORTLIST,
        ], sendAPIRequest
    );
}

export default companySaga;