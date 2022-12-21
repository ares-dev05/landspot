import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';

import userProfileSaga from './userProfile/sagas';
import userProfileReducer from './userProfile/reducer';

const reducers = combineReducers({
  userProfile: userProfileReducer,
  routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducers,
  process.env.NODE_ENV === 'production'
    ? applyMiddleware(sagaMiddleware)
    : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(userProfileSaga);

export default store;