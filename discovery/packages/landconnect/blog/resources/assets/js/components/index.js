import React from "react";
import ReactDOM from 'react-dom';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from '~blog~/helpers';

import App from "./App";
(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <App/>
    </AlertProvider>,
    node
))(document.getElementById('blog'));