import React, {Component} from 'react';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import BuilderFloorplansRoutes from './builder';
import DrawerRoutes from './sitings-drawer';
import Layout from './layout/Layout';
import {NoMatch} from '~sitings~/helpers';

class Routers extends Component {

    componentDidUpdate() {
        if (!this.props.user) {
            window.location.assign('/sitings/login');
        }
    }

    render() {

        if (this.props.error && this.props.error.match(/unauthorized/)) {
            window.location.assign('/sitings/login');
        }

        const user = this.props.user;
        return (
            <Router>
                {user
                    ? <Layout>
                        <div className='container portal-content'>
                            <Switch>
                                <BuilderFloorplansRoutes path='/sitings/plans/floorplans'/>
                                <DrawerRoutes path='/sitings/drawer'/>
                                <Route component={NoMatch}/>
                            </Switch>
                        </div>
                    </Layout>
                    : <NoMatch/>
                }
            </Router>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.userProfile.user,
        error: state.errorHandler.error
    };
}

export default connect(mapStateToProps)(Routers);
