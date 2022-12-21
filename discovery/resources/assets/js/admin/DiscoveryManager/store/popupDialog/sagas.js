import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* popupDialogSaga() {
    yield takeLatest([
            ActionTypes.GET_HOUSE_DETAILS,
            ActionTypes.SAVE_HOUSE_DETAILS,
            ActionTypes.SAVE_HOUSE,
            ActionTypes.GET_HOUSE_MEDIA,
            ActionTypes.UPDATE_HOUSE_MEDIA,
            ActionTypes.REMOVE_HOUSE_MEDIA,
            ActionTypes.SAVE_RANGE_INCLUSIONS,
            ActionTypes.SET_COMPANY_PROFILE_DATA,
        ], sendAPIRequest
    );
}

export default popupDialogSaga;