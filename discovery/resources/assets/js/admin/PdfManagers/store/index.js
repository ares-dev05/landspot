import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';

import estateSaga from './estate/sagas';
import catalogueSaga from './catalogue/sagas';
import popupDialogSaga from './popupDialog/sagas';

import estateReducer from './estate/reducer';
import catalogueReducer from './catalogue/reducer';
import popupDialog from './popupDialog/reducer';

const reducers = combineReducers({
    estate: estateReducer,
    catalogue: catalogueReducer,
    popupDialog: popupDialog,
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
sagaMiddleware.run(estateSaga);
sagaMiddleware.run(popupDialogSaga);

export default store;