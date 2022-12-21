import React, {Component} from 'react';
import {Provider} from 'react-redux';
import store from '../store';
import {getUser} from './user-profile/store/actions';
import Routers from './Routers';

class App extends Component {

    componentDidMount() {
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