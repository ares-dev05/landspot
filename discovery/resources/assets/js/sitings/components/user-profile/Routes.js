import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {NoMatch} from "~sitings~/helpers";

const Routes = () => (
    <Switch>
        <Route component={NoMatch} />
    </Switch>
);

export default Routes;