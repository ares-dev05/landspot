import {combineReducers, createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger/src';
import {routerReducer} from 'react-router-redux';
import mySaga from './catalogue/sagas';
import estateSaga from './estate/sagas';
import popupDialogSaga from './popupDialog/sagas';
import lotPackagesSaga from './lotPackages/sagas';

import catalogueReducer from './catalogue/reducer';
import estateReducer from './estate/reducer';
import popupDialogReducer from './popupDialog/reducer';
import viewLotPackagesReducer from './lotPackages/reducer';

const reducers = combineReducers({
    catalogue: catalogueReducer,
    estate: estateReducer,
    popupDialog: popupDialogReducer,
    lotPackages: viewLotPackagesReducer,
    routing: routerReducer
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware(sagaMiddleware)
        : applyMiddleware(logger, sagaMiddleware)
);

sagaMiddleware.run(mySaga);
sagaMiddleware.run(estateSaga);
sagaMiddleware.run(popupDialogSaga);
sagaMiddleware.run(lotPackagesSaga);

export default store;