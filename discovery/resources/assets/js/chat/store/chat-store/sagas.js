import {takeLatest, throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';

import * as chatActions from './actions/chat';
import * as contactBookActions from './actions/contact-book';
import * as directoryActions from './actions/directory';

function* chatSaga() {
    yield takeLatest([
            chatActions.GET_CHAT_USER_DATA,
            chatActions.GET_RECENT_CHATS,
            chatActions.OPEN_CHAT_CHANNEL,
            contactBookActions.GET_CONTACTS_BOOK,
            directoryActions.GET_DIRECTORY,
            directoryActions.GET_OBJECT_CONTACTS,
        ],
        sendAPIRequest
    );
}
/*
function* ChatAPIRequest(action) {
    try {
        let data;
        switch (action.type) {
            case ActionTypes.CHAT_ENGINE_LOAD_MESSAGES:
                data = yield call(chatEngineChannelHistoryRequest, action.payload);
            break;

            case ActionTypes.FETCH_BATCH_CHANNELS_HISTORY:
                data = yield call(chatEngineBulkHistoryRequest, action.payload);
                break;
        }
        yield put({type: success(action.type), payload: {data}});
    } catch (e) {
        yield put({type: error(action.type), message: e.message})
    }
}

function chatEngineChannelHistoryRequest(payload) {
    const {chat} = payload;
    return new Promise((resolve, reject) => {
        try {
            let messages = [];
            chat.search({
                event: 'message',
                limit: 50
            }).on('message', (event) => {
                messages.push({
                    data: event.data,
                    sender: event.sender,
                    timetoken: parseInt(event.timetoken)
                });
            }).on('$.search.finish', () => {
                resolve({chatMessages: messages.reverse()})
            });

        } catch (e) {
            reject(e);
        }
    });
}

function chatEngineBulkHistoryRequest(payload) {
    const {chatEngine, channels, timeRange} = payload;
    return new Promise((resolve, reject) => {
        try {
            //debugger
            chatEngine.pubnub.fetchMessages(
                {
                    channels,
                    start: timeRange.start,
                    end: timeRange.end,
                    count: 1
                },
                (status, response) => {
                    if(!status || status.error || !response) {
                        reject(status);
                        return;
                    }
                    resolve(response)
                }
            );

        } catch (e) {
            reject(e);
        }
    });
}*/

export default chatSaga;