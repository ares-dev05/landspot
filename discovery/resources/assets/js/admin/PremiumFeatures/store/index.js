import {routerReducer} from 'react-router-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import logger from 'redux-logger/src';
import createSagaMiddleware from 'redux-saga';

import companiesReducer from './companies/reducer';
import companiesSaga from './companies/sagas';
import companyReducer from './company/reducer';
import companySaga from './company/sagas';
import estateReducer from './estate/reducer';
import estateSaga from './estate/sagas';

const reducers = combineReducers({
    companiesData: companiesReducer,
    companyData: companyReducer,
    estateData: estateReducer,
    routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(companiesSaga);
sagaMiddleware.run(companySaga);
sagaMiddleware.run(estateSaga);

export default store;