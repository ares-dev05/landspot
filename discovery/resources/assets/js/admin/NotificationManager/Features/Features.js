import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import FeaturesForm from './FeaturesForm';
import FeaturesTable from './FeaturesTable';

const Features = () => (
    <Router>
        <Switch>
            <Route exact path={'/landspot/notifications/features'} component={FeaturesTable} />
            <Route path={'/landspot/notifications/features/create'} component={FeaturesForm} />
            <Route path={'/landspot/notifications/features/:notificationId/edit'} component={FeaturesForm} />
        </Switch>
    </Router>
);

export default Features;