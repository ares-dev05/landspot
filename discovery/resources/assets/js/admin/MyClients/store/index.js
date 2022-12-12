import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';
import myClientsSaga from './myClients/sagas';
import popupDialogSaga from './popupDialog/sagas';

import myClientsReducer from './myClients/reducer';
import popupDialogReducer from './popupDialog/reducer';

const reducers = combineReducers({
    myClients: myClientsReducer,
    routing: routerReducer,
    popupDialog: popupDialogReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(myClientsSaga);
sagaMiddleware.run(popupDialogSaga);

export default store;
