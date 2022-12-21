import React from 'react';
import {Route, Switch, withRouter} from 'react-router-dom';
import {NoMatch} from '~sitings~/helpers';
import FloorplansInstance, {Floorplans} from './components/Floorplans';

class Index extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path={`${Floorplans.componentUrl}/:floorplanId`}
                       component={FloorplansInstance}/>
                <Route exact path={Floorplans.componentUrl} component={FloorplansInstance}/>
                <Route component={NoMatch}/>
            </Switch>
        )
    }
}

export default withRouter(Index);