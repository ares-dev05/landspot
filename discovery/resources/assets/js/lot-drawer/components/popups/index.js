import React from 'react';
import {Provider} from 'react-redux';
import store from '../../store';
import LotDrawerDetailsDialog from "./LotDrawerDetailsDialog";

const LotDrawerDetails = (props) => (
    <Provider store={store}>
        <LotDrawerDetailsDialog {...props}/>
    </Provider>
);

export default LotDrawerDetails;