import React from 'react';
import {Route, Switch} from 'react-router-dom';
import LandspotRoutes from './landspot/Routes';
import DiscoveryRoutes from './discovery/Routes';
import {NoMatch} from '~/helpers';

const LayoutElement = () => (
    <Switch>
        <DiscoveryRoutes path="/floorplans"/>
        <LandspotRoutes path="/land-for-sale"/>
        <Route render={() => <NoMatch offset/>}/>
    </Switch>
);

export default LayoutElement;