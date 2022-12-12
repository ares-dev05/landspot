import React, {Component} from 'react';
import {Provider} from 'react-redux';
import store from '../store';
import Routers from './Routers';
import {getUser} from './profile/store/actions';

class App extends Component {

    componentWillMount() {
        store.dispatch(getUser());
    }

    render() {
        return (
            <Provider store={store}>
                <Routers/>
            </Provider>
        );
    }
}


export default App;