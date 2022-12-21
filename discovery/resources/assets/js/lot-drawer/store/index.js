import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';

import lotDrawerSaga from './drawer/sagas';
import popupDialogSaga from './popupDialog/sagas';

import lotDrawerReducer from './drawer/reducer';
import pagePreviewReducer from './pagePreview/reducer';
import popupDialogReducer from './popupDialog/reducer';

const reducers = combineReducers({
    lotDrawer: lotDrawerReducer,
    pagePreview: pagePreviewReducer,
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

sagaMiddleware.run(lotDrawerSaga);
sagaMiddleware.run(popupDialogSaga);

export default store;