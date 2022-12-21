import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';
import chatSaga from './chat-store/sagas';
import activeChannelSaga from './channel/sagas';
import browserNotificationSaga from './browserNotification/sagas';

import chatReducer from './chat-store/reducer';
import activeChatReducer from './channel/reducer';
import browserNotificationReducer from './browserNotification/reducer';
import minimizedChatReducer from './minimized-chat/reducer';

const reducers = combineReducers({
    chatData: chatReducer,
    activeChat: activeChatReducer,
    browserNotification: browserNotificationReducer,
    minimizedChat: minimizedChatReducer,
    routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(chatSaga);
sagaMiddleware.run(activeChannelSaga);
sagaMiddleware.run(browserNotificationSaga);

export default store;