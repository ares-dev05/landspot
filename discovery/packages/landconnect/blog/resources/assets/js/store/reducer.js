import camelCase from 'lodash/camelCase';
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';


const reducers = {
    routing: routerReducer
};

const req = require.context('../components', true, /\.\/.+\/reducer\.js$/);

req.keys().forEach(key => {
    const storeName = camelCase(key.replace(/\.\/(.+)\/.+$/, '$1').replace('admin', '').replace('store', ''));
    console.log(`reducer: ${key} `, `store: ${storeName}` );
    if(reducers[storeName]) throw `Duplicate store ${storeName}`;
    reducers[storeName] = req(key).default;
});
console.log('reducers', reducers);
export default combineReducers(reducers);
