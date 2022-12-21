import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {NoMatch} from '~/helpers';
import {LandspotEstates, LandspotEstatesInstance} from './LandspotEstates';
import EstateInstance, {Estate} from './components/Estate';
import {LotmixLotPackageInstance, LotPackages} from '~/landspot/LotPackages';

const Routes = () => (
    <div className={'primary-container responsive-container find-land-page'}>
        <Switch>
            <Route
                exact
                path={LandspotEstates.componentUrl}
                component={LandspotEstatesInstance}
            />
            <Route
                exact
                path={Estate.componentUrl}
                component={EstateInstance}/>
            <Route
                exact
                path={LotPackages.componentUrl}
                component={LotmixLotPackageInstance}
            />
            <Route component={NoMatch}/>
        </Switch>
    </div>
);

export default Routes;
