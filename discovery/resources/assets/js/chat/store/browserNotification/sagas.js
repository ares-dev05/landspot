import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';

import * as browserNotificationActions from './actions';

function* activeChannelSaga() {
    yield takeLatest(browserNotificationActions.GET_BROWSER_NOTIFICATION_CHANNELS, sendAPIRequest);
}

export default activeChannelSaga;