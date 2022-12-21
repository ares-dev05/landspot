import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import Features from './Features/Features';
import MediaTable from './Media/MediaTable';
import LotmixNotificationComponent from './LotmixNotification/LotmixNotificationComponent';
import store from './store/index';

const NotificationManager = () => (
    <Provider store={store}>
        <section className="content notifications">
            <Router>
                <Switch>
                    <Route path={'/landspot/notifications/features'} component={Features} />
                    <Route path={'/landspot/notifications/media-file'} component={MediaTable} />
                    <Route path={'/landspot/notifications/lotmix-notification'} component={LotmixNotificationComponent} />
                </Switch>
            </Router>
        </section>
    </Provider>
);

export default NotificationManager;