import React from 'react';
import {Route, Switch, withRouter} from 'react-router-dom';

import {DrawerContainer, DrawerContainerInstance} from './DrawerContainer';
import {NoMatch} from '~sitings~/helpers';

class Index extends React.Component {
    componentWillUnmount() {
        const node = document.body.querySelector('.sitings-container');
        node.classList.remove('primary-container', 'responsive-container', 'sitings-container');
        node.classList.add('container', 'portal-content');
    }

    componentDidMount() {
        const node = document.body.querySelector('.container');
        node.classList.remove('container', 'portal-content');
        node.classList.add('primary-container', 'responsive-container', 'sitings-container');
    }

    render() {
        return (
            <Switch>
                <Route path={DrawerContainer.componentUrl}
                       component={DrawerContainerInstance}/>
                <Route component={NoMatch}/>
            </Switch>
        )
    }
}

export default withRouter(Index);