import React, {Component} from 'react';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Switch} from 'react-router-dom';
import BlogRoutes from './blog/Routes';
import Layout from "./layout/Layout";

class Routers extends Component {
    render() {
        if (this.props.error === "Unauthorized action.") {
            location.assign('/insights');
        }

        return (
            <Router>
                <Layout>
                    <div className="blog-content">
                        <Switch>
                            <BlogRoutes path={'/insights'}/>
                        </Switch>
                    </div>
                </Layout>
            </Router>
        );
    }
}

function mapStateToProps(state) {
    return {
        error: state.errorHandler.error
    };
}

export default connect(mapStateToProps)(Routers);
