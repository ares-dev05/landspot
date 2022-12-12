import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';
import kaspaEngineSaga from './kaspaEngine/sagas';

import kaspaEngineReducer from './kaspaEngine/reducer';

const reducers = combineReducers({
    kaspaEngine: kaspaEngineReducer,
    routing: routerReducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(kaspaEngineSaga);

export default store;
