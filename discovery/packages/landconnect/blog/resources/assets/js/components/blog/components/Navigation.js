import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink, withRouter} from "react-router-dom";
import * as actions from '../../profile/store/actions';
import {clickHandler} from '~blog~/helpers';

class Navigation extends Component {
    constructor(props) {
        super(props);
    }

    isActiveTopic = (topicName) => {
        return this.props.activeTopic === topicName;
    };

    render() {
        const isAdmin = this.props.user.isAdmin;
        const topics  = this.props.topics;
        return (
            <nav className="main">
                <ul className="main-nav">
                    <li className="nav-item">
                        <NavLink isActive={() => this.isActiveTopic('')}
                                 exact
                                 to={'/insights/'}>
                            All topics
                        </NavLink>
                    </li>
                    {topics.map(
                        topic => <li key={topic.id} className="nav-item">
                            <NavLink isActive={() => this.isActiveTopic(topic.title)}
                                     exact
                                     to={`/insights?topic=${topic.title}`}>
                                {topic.title}
                            </NavLink>
                        </li>
                    )}
                    {isAdmin &&
                    <li className="nav-item">
                        <a href="/insights/admin">
                            Admin panel
                        </a>
                    </li>
                    }
                </ul>
            </nav>
        );
    }
}


function mapStateToProps(state) {
    return {
        topics: state.blogPosts.topics,
        user: state.profile.user,
    };
}

export default withRouter(connect(mapStateToProps, actions)(Navigation));
