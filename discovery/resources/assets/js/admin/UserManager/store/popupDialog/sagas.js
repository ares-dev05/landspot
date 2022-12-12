import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* popupDialogSaga() {
    yield takeLatest([
            ActionTypes.LOAD_ESTATES_WITH_USER_PERMISSIONS,
            ActionTypes.GET_COMPANY_DATA,
            ActionTypes.SAVE_PERMISSIONS,
            ActionTypes.SAVE_SALES_LOCATIONS,
            ActionTypes.SAVE_LOTMIX_SETTINGS,
        ],
        sendAPIRequest
    );
}

export default popupDialogSaga;