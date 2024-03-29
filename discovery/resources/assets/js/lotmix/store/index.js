import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';

import reducers from './reducer';
import sagas from './sagas';


const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(sagas);

export default store;