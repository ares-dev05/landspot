import {takeEvery, takeLatest, throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';

import * as channelActions from './actions';

function* activeChannelSaga() {
    yield takeEvery([
            channelActions.SEND_MESSAGE
        ],
        sendAPIRequest
    );

    yield throttle(2000, channelActions.LOAD_CHANNEL_HISTORY, sendAPIRequest);
    yield takeLatest(channelActions.LOAD_CHANNEL_HISTORY_PREPEND, sendAPIRequest);
    yield throttle(1000, channelActions.UPDATE_CHANNEL_READ_TIME, sendAPIRequest);
}

export default activeChannelSaga;