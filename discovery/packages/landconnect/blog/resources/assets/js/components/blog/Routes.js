import React from 'react';
import {Route, Switch} from 'react-router-dom';
import PostsList from "./components/PostsList";
import Post from "./components/Post";
import PostsCatalogue from "./PostsCatalogue";

const Routes = () => (
    <Switch>
        <Route exact path={PostsList.componentUrl + '/:slug'} component={PostsCatalogue}/>
        <Route exact path={PostsList.componentUrl} component={PostsCatalogue}/>
    </Switch>
);

export default Routes;