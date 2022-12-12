import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* projectSaga() {
    yield takeLatest(
        [
            ActionTypes.SEND_ESTATE_ENQUIRE_FORM,
            ActionTypes.SEND_COMPANY_ENQUIRE_FORM,
            ActionTypes.SEND_SMS_VERIFICATION,
            ActionTypes.VERIFY_SMS_CODE
        ],
        sendAPIRequest
    );
}

export default projectSaga;
