import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import NotificationsTable from './NotificationsTable';
import NotificationsForm from './NotificationsForm';

const LotmixNotificationComponent = () => (
    <Router>
        <Switch>
            <Route exact path={'/landspot/notifications/lotmix-notification'} component={NotificationsTable} />
            <Route path={'/landspot/notifications/lotmix-notification/create'} component={NotificationsForm} />
            <Route path={'/landspot/notifications/lotmix-notification/:notificationId/edit'} component={NotificationsForm} />
        </Switch>
    </Router>
);

export default LotmixNotificationComponent;