import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';

import usersSaga from './users/sagas';
import catalogueSaga from './catalogue/sagas';
import popupDialogSaga from './popupDialog/sagas';

import usersReducer from './users/reducer';
import catalogueReducer from './catalogue/reducer';
import popupDialog from './popupDialog/reducer';
import popupMessages from './popupMessages/reducer';

const reducers = combineReducers({
  users: usersReducer,
  catalogue: catalogueReducer,
  popupDialog: popupDialog,
  popupMessage: popupMessages,
  routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducers,
  process.env.NODE_ENV === 'production'
    ? applyMiddleware(sagaMiddleware)
    : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(catalogueSaga);
sagaMiddleware.run(usersSaga);
sagaMiddleware.run(popupDialogSaga);

export default store;