import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';

import catalogueSaga from './catalogue/sagas';
import catalogueReducer from './catalogue/reducer';

import companySaga from './company/sagas';
import companyReducer from './company/reducer';

const reducers = combineReducers({
    catalogue: catalogueReducer,
    company: companyReducer,
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
sagaMiddleware.run(companySaga);

export default store;