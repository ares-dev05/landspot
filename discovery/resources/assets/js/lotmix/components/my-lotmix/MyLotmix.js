import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import * as actions from './store/home/actions';
import ContentSection from './components/ContentSection';
import {LoadingSpinner, PathNavLink} from '~/helpers';
import store from '../../store';
import _ from 'lodash';
import {LandspotEstates} from '../landspot/LandspotEstates';

const PostItem = ({post}) => {
    const smallImage = _.get(post.thumb, 'media.smallImage', '');
    return <div className="ex-blck">
        <div title="exclusive"
             className="ex-image"
             style={{backgroundImage: smallImage && `url(${smallImage})`}}/>
        <p className="ex-title">{post.title}</p>
        <p className="ex-description">{post.description}</p>
        <a className="learn-more"
           href={`/insights/${post.slug}`}><i className="fal fa-angle-right"/>Learn more</a>
    </div>;
};

class MyLotmix extends Component {
    static componentUrl = '/home';
    static title = 'Home';

    static propTypes = {
        getLotmix: PropTypes.func.isRequired,
        resetMessages: PropTypes.func.isRequired,
        resetLotmixStore: PropTypes.func.isRequired
    };

    state = {
        preloader: true
    };


    componentDidMount() {
        this.props.getLotmix();
    }

    componentWillUnmount() {
        this.props.resetLotmixStore();
    }

    static getDerivedStateFromProps(props) {
        const {
            myLotmix: {LOTMIX_UPDATED, errors},
            alert: {error}
        } = props;
        let newState = {};

        if (errors && errors.length) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                ))
            );
            store.dispatch({type: actions.RESET_LOTMIX_MESSAGES});
            newState.preloader = false;
        }

        if (LOTMIX_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_LOTMIX_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    render() {
        const {
            userProfile: {user},
            myLotmix: {relatedPosts}
        } = this.props;
        const {preloader} = this.state;
        return (
            <div className="my-lotmix-wrapper">
                <div className="my-lotmix">
                    {preloader && <LoadingSpinner className="overlay"/>}
                    <div className="welcome-block">
                        <div className="greeting">
                            <div>
                                <h1 className="home-h1 dots-top-left">
                                    <span className="theme-color">Hi, {user.first_name}</span>
                                    <br/>
                                    Welcome to Lotmix
                                </h1>
                                <p className="greeting-text">Your place to connect, communicate and manage building your
                                    new
                                    home.</p>
                            </div>
                        </div>
                        <div className="greeting-img"/>
                    </div>
                    <ContentSection isBuilderUser={user.isBuilderUser} isBriefUser={user.isBriefUser}/>
                    <div className="sunpath-block">
                        <div className="sunpath-img" title="sunpath"/>
                        <div className="description-block">
                            <div className="description">
                                <p className="home-h1 dots-top-left">Test a Sunpath</p>
                                <p className="description-text">Visualise and animate the sun path over a lot of
                                    land </p>
                            </div>
                            <a className="lotmix-button" href="/sunpather/">Test a Sunpath now</a>
                        </div>
                    </div>
                    <div className="my-shortlist">
                        <div className="description-block">
                            <div className="description">
                                <p className="home-h1 dots-top-left">My shortlist</p>
                                <p className="description-text">As you browse floorplans and lots you can start to
                                    create a shortlist of your favorite designs</p>
                            </div>
                            <div className="my-shortlist_buttons">
                                <PathNavLink to="/floorplans/"
                                             className="lotmix-button">Browse Floorplans</PathNavLink>
                                <PathNavLink to={LandspotEstates.componentUrl}
                                             className="lotmix-button">Browse Lots</PathNavLink>
                            </div>
                        </div>
                        <div className="shortlist-bg"/>
                    </div>
                    <div className="exclusive-insights">
                        <div className="ex-header">
                            <p className="home-h1 dots-bottom-right">Access exclusive Insights</p>
                            <p className="description-text">Learn from in-depth educational guides from how to pick a
                                perfect lot of
                                land to understanding all the little things people forget when building a home.</p>
                        </div>
                        {relatedPosts.map(post => <PostItem key={post.id} post={post}/>)}
                    </div>
                    <footer className="lotmix-footer">
                        <div className="footer-container">
                            <a className="footer-logo" href="/" title="Lotmix"/>
                            <p className="footer-text">
                                Lotmix is run and operated by Landconnect Global Pty Ltd. Landconnect has been servicing
                                new home
                                builders and developers with smart and simple technology throughout Australia since
                                2014.
                            </p>
                            <div className="footer-links">
                                <a href="/privacy-policy/">Privacy
                                    Policy</a>
                                <a href="/tos/">Terms of Use</a>
                                <a href="#">Contact Us</a>
                            </div>
                            <p className="footer-copyright">© {new Date().getFullYear()} Lotmix </p>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

const MyLotmixInstance = withAlert(
    connect(
        state => ({
            userProfile: state.profile,
            myLotmix: state.myLotmixHome
        }),
        actions
    )(MyLotmix)
);

export {MyLotmixInstance, MyLotmix};
