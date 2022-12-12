import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {NoMatch} from '~/helpers';
import Form from './components/form';
import Home from './components/home';
import './styles/index.scss';

const Routes = () => (
    <Switch>
        <Route exect path="/sunpather/form/" component={Form}/>
        <Route exect path="/sunpather/" component={Home}/>
        <Route component={NoMatch}/>
    </Switch>
);

export default Routes;