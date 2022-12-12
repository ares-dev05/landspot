import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {NoMatch} from '~/helpers';
import CompaniesCatalogue from './CompaniesCatalogue';
import House from './House';

const Routes = () => (
    <Switch>
        <Route exact path={'/floorplans'} component={CompaniesCatalogue}/>
        <Route exact path={'/floorplans/homebuilder/:slug/'} component={CompaniesCatalogue}/>
        <Route exact path={'/floorplans/overview/:houseId'} component={House}/>
        <Route exact path={'/floorplans/floorplan/:houseId'} component={House}/>
        <Route exact path={'/floorplans/available-options/:houseId'} component={House}/>
        <Route exact path={'/floorplans/gallery/:houseId'} component={House}/>
        <Route exact path={'/floorplans/volume/:houseId'} component={House}/>
        <Route component={NoMatch}/>
    </Switch>
);

export default Routes;