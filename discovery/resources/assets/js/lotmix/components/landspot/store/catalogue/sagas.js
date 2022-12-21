import {throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';


function* mySaga() {
  yield throttle(2000, ActionTypes.FILTER_ESTATE_LIST, sendAPIRequest);
}

export default mySaga;