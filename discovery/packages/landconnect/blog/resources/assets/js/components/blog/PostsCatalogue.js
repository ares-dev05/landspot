import React, {Component} from 'react';
import {Route, Switch, withRouter} from 'react-router-dom';

import PostsList from "./components/PostsList";
import Post from "./components/Post";

class PostsCatalogue extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route exact path={PostsList.componentUrl} component={PostsList}/>
                <Route exact path={PostsList.componentUrl + '/:slug'} component={Post}/>
            </Switch>
        );
    }
}

export default withRouter(PostsCatalogue);