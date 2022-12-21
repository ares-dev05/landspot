import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';

import reducer from './estate/reducer';
import sagas from './estate/sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducer,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(sagas);

export default store;