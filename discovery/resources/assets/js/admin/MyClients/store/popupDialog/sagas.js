import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* projectSaga() {
    yield takeLatest(
        [
            ActionTypes.GET_SHORT_LISTS,
            ActionTypes.UPDATE_SHORT_LIST,
            ActionTypes.GET_INVITED_USER_DETAILS,
            ActionTypes.UPDATE_USER_DETAILS,
            ActionTypes.GET_MY_SITINGS,
            ActionTypes.GET_LEGACY_SITINGS,
            ActionTypes.UPDATE_MY_CLIENT,
            ActionTypes.DELETE_POPUP_SITING,
            ActionTypes.CLONE_EXISTING_POPUP_SITING,
            ActionTypes.DELETE_INVITED_USER_SITING,
            ActionTypes.UPLOAD_DOCUMENT,
            ActionTypes.GET_AVAILABLE_MANAGERS,
            ActionTypes.GET_DRAFT_SITING_MANAGERS,
            ActionTypes.SHARE_BUYER_CREDENTIALS,
            ActionTypes.SHARE_DRAFT_SITING,
            ActionTypes.IMPORT_SITING
        ],
        sendAPIRequest
    );
}

export default projectSaga;
