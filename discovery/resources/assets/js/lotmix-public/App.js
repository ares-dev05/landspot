import React, {Component} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './estates-locator/store';
import Routers from './Routers';

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <Routers/>
                </BrowserRouter>
            </Provider>
        );
    }
}


export default App;