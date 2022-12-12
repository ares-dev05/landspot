import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~sitings~/axios/api';
import {UPDATE_FLOORPLAN_HISTORY} from '../../builder/store/floorplans/actions';
import * as ActionTypes from './actions';

function* saga() {
    yield takeLatest([
        ActionTypes.GET_FLOORPLAN_HISTORY,
        ActionTypes.GET_FLOORPLAN_DATA,
        ActionTypes.STORE_FLOORPLAN_FORM,
        UPDATE_FLOORPLAN_HISTORY,
        ActionTypes.GET_FLOORPLAN_FILES,
        ActionTypes.STORE_FLOORPLAN_SVG,
        ActionTypes.GET_CLIENTS_LIST,
    ], sendAPIRequest);
}

export default saga;