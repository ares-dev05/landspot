import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import {routerReducer} from 'react-router-redux';
import notifications from './Features/reducer';
import mediaFiles from './Media/reducer';
import lotmixNotification from './LotmixNotification/reducer';
import featureNotificationsSaga from './Features/sagas';
import lotmixNotificationSaga from './LotmixNotification/sagas';
import notificationMediaSaga from './Media/sagas';

const reducers = combineReducers({
    notifications,
    lotmixNotification,
    media: mediaFiles,
    routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(featureNotificationsSaga);
sagaMiddleware.run(lotmixNotificationSaga);
sagaMiddleware.run(notificationMediaSaga);

export default store;
