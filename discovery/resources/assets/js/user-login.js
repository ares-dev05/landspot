import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import UserLoginForm from './login';
import store from './login/store';

(node => node && ReactDOM.render(
    <Provider store={store}>
        <UserLoginForm/>
    </Provider>,
    node
))(document.getElementById('user-login-form'));