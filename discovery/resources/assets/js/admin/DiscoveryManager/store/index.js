import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';
import managerSaga from './manager/sagas';
import popupDialogSaga from './popupDialog/sagas';

import managerReducer from './manager/reducer';
import popupDialogReducer from './popupDialog/reducer';

const reducers = combineReducers({
    manager: managerReducer,
    popupDialog: popupDialogReducer,
    routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(managerSaga);
sagaMiddleware.run(popupDialogSaga);

export default store;