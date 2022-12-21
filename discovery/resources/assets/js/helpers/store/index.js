import React, {Component} from 'react';
import {combineReducers, createStore, applyMiddleware} from 'redux';
import logger from 'redux-logger/src';
import dropdown from './dropdown/reducer';

const reducers = combineReducers({
    dropdown
});

const store = createStore(
    reducers,
    process.env.NODE_ENV === 'production'
        ? applyMiddleware()
        : applyMiddleware(logger)
);

export default store;