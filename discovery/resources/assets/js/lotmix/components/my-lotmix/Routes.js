import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {MyLotmixInstance, MyLotmix} from './MyLotmix';
import {NoMatch} from '~/helpers';
import {CompanyInstance, Company} from './components/Company';
import {EstateInstance, Estate} from './components/EstateComponent/Estate';

const Routes = () => (
    <div className={'primary-container responsive-container'}>
        <Switch>
            <Route
                exact
                path={MyLotmix.componentUrl}
                component={MyLotmixInstance}
            />
            <Route path={Company.componentUrl} component={CompanyInstance}/>
            <Route path={Estate.componentUrl} component={EstateInstance}/>
            <Route component={NoMatch}/>
        </Switch>
    </div>
);

export default Routes;
