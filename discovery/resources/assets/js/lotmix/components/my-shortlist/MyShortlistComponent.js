import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';

import MyFloorplans from './MyFloorplans';
import MyLots from './MyLots';
import * as actions from './store/actions';
import {RightPanel} from '~/helpers/Panels';
import {isEqual} from 'lodash';
import {LoadingSpinner, PathNavLink} from '~/helpers';
import Media from 'react-media';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';

class MyShortlistComponent extends Component {
    static componentUrl = '/my-shortlist';
    static title = 'My Shortlist';
    static propTypes = {
        getShortlistData: PropTypes.func.isRequired
    };
    state = {
        preloader: false,
        userAction: null,
        userActionData: null
    };

    componentDidMount() {
        this.props.getShortlistData();
    }

    onHouseSelect = house => {
        const {pathname, search} = this.props.location;
        this.props.history.push(
            this.props.catalogue.basePath + '/overview/' + house.id,
            {resultsUrl: pathname + search}
        );
    };

    setUserAction = (action, actionData) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);
        const {userAction, userActionData} = this.state;

        const actionChanged =
            action !== userAction ||
            (actionData != null && !isEqual(actionData, userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        }
    };

    render() {
        const {preloader} = this.state;
        const {companies, estates} = this.props;
        const {userAction, userActionData} = this.state;

        return (
            <React.Fragment>
                <DialogList userAction={userAction} userActionData={userActionData}
                            setUserAction={this.setUserAction}/>
                {
                    companies && estates && !companies.length && !estates.length ?
                        <div className="shortlist-no-content-container">
                            <div className="left-panel">
                                <div className="centered">
                                    <div className="title">
                                        Start building your shortlist
                                    </div>
                                    <div className="description">
                                            <span>
                                                As you browse floorplans and lots you can start to create
                                            a shortlist of your favorite designs. To add a floorplan or lot
                                                to your short list click the
                                            </span>
                                        <i className="fas fa-heart fa-2x"/>
                                    </div>
                                    <Media query="(min-width: 761px)">
                                        <div className="actions">
                                            <PathNavLink to="/floorplans/" className="browse-floorplans button default">Browse
                                                Floorplans</PathNavLink>
                                            <PathNavLink to="/land-for-sale/communities/"
                                                         className="browse-lots button default">Browse
                                                Lots</PathNavLink>
                                        </div>
                                    </Media>
                                </div>
                            </div>
                            <div className="right-panel">
                                <div className="back-image"/>
                                <Media query="(max-width: 760px)">
                                    <div className="actions">
                                        <PathNavLink to="/floorplans/" className="browse-floorplans button default">Browse
                                            Floorplans</PathNavLink>
                                        <PathNavLink to="/land-for-sale/communities/" className="browse-lots button default">Browse
                                            Lots</PathNavLink>
                                    </div>
                                </Media>
                            </div>
                        </div>
                        :
                        <RightPanel className="wrap-items my-lotmix shortlist">
                            {preloader && <LoadingSpinner className="overlay"/>}
                            <div className="shortlist-content">
                                <div className="header">
                                    <div className="content">
                                        <div className="heading">My Shortlist</div>
                                    </div>
                                </div>

                                <div className="entity-grid">
                                    {!companies
                                        ? <div className='content'>
                                            <LoadingSpinner className="static"/>
                                        </div>
                                        : companies.length
                                            ? <MyFloorplans
                                                onHouseSelect={this.onHouseSelect}
                                                companies={companies}
                                            />
                                            : ''
                                    }
                                    {!estates
                                        ? <div className='content'>
                                            <LoadingSpinner className="static"/>
                                        </div>
                                        : estates.length
                                            ? <MyLots estates={estates} setUserAction={this.setUserAction}/>
                                            : ''
                                    }

                                </div>
                            </div>
                        </RightPanel>
                }
            </React.Fragment>
        );
    }
}

const MyShortlistComponentInstance = withAlert(
    connect(
        state => ({
            catalogue: state.discoveryCatalogue,
            ...state.myShortlist
        }),
        actions
    )(MyShortlistComponent)
);

export {MyShortlistComponentInstance, MyShortlistComponent};
