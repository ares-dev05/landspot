import {takeEvery, takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import {takeLeading} from '~/axios/effects';
import * as ActionTypes from './actions';

function* popupDialogSaga() {
    yield takeLatest([
            ActionTypes.LOAD_LOT_VISIBILITY,
            ActionTypes.LOAD_LOT_PACKAGES,
            ActionTypes.LOAD_LOT_PACKAGES_FOR_UPLOAD,
            ActionTypes.LOAD_ESTATE_DOCUMENTS,
            ActionTypes.LOAD_PDF_TEMPLATE,
        ], sendAPIRequest
    );

    yield takeEvery([
        ActionTypes.UPDATE_LOT_PACKAGES,
        ActionTypes.UPDATE_PDF_TEMPLATE,
    ], sendAPIRequest);

    yield takeLeading([
        ActionTypes.UPDATE_LOT_VISIBILITY,
        ActionTypes.ADD_ESTATE,
        ActionTypes.DELETE_ESTATE_PACKAGE,
        ActionTypes.DELETE_LOT_PACKAGE,
    ], sendAPIRequest);

}

export default popupDialogSaga;