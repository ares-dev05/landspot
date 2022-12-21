import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {
    MyShortlistComponentInstance,
    MyShortlistComponent
} from './MyShortlistComponent';
import {NoMatch} from '~/helpers';

const Routes = () => (
    <div className={'primary-container responsive-container'}>
        <Switch>
            <Route
                exact
                path={MyShortlistComponent.componentUrl}
                component={MyShortlistComponentInstance}
            />
            <Route component={NoMatch}/>
        </Switch>
    </div>
);

export default Routes;
