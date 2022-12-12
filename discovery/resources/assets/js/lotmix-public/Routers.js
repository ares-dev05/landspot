import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {NoMatch} from '~/helpers';
import {withRouter} from 'react-router-dom';
import {EstateLocator, EstateLocatorInstance} from './estates-locator/EstateLocator';

const Routes = () => {
    return (
        <div className={'lotmix-public primary-container responsive-container responsive-container-sm-flex'}
             style={{paddingTop: 60 + 'px'}}>
            <Switch>
                <Route exact path={EstateLocator.suburbUrl} component={EstateLocatorInstance}/>
                <Route exact path={EstateLocator.stateUrl} component={EstateLocatorInstance}/>
                <Route component={NoMatch}/>
            </Switch>
        </div>);
};

export default withRouter(Routes);