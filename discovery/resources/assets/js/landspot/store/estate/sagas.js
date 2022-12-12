import {takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* estateSaga() {
    yield takeLatest(
        [
            ActionTypes.ADD_COLUMN,
            ActionTypes.RENAME_COLUMN,
            ActionTypes.ADD_LOT,
            ActionTypes.ADD_STAGE,
            ActionTypes.DELETE_STAGE,
            ActionTypes.MOVE_COLUMN,
            ActionTypes.REMOVE_COLUMN,
            ActionTypes.REMOVE_LOT,
            ActionTypes.UPDATE_ESTATE,
            ActionTypes.UPDATE_ESTATE_DESCRIPTION,
            ActionTypes.UPDATE_LOT,
            ActionTypes.UPDATE_STAGE,
            ActionTypes.SAVE_PRICE_LIST,
            ActionTypes.DELETE_ESTATE_IMAGE,
            ActionTypes.ADD_AMENITY,
            ActionTypes.UPDATE_LOTMIX_LOT_VISIBILITY,
            ActionTypes.UPDATE_SNAPSHOTS,
            ActionTypes.UPDATE_ANSWERS,
            ActionTypes.BULK_UPDATE_LOT
        ],
        sendAPIRequest
    );

    yield throttle(2000, ActionTypes.GET_ESTATE_LOTS, sendAPIRequest);
}

export default estateSaga;
