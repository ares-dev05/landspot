import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import Media from 'react-media';
import {ContentPanel, LeftPanel} from '~/helpers/Panels';
import Sidebar from './components/house/Sidebar';
import View from './components/house/View';
import {isEqual} from 'lodash';
import {CloseDiscoveryLink, LoadingSpinner, PathNavLink} from '~/helpers';

import {HouseContext} from '~/discovery/House';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';
import UserAction from '~/lotmix/components/discovery/constants';
import {LandspotEstates} from '../landspot/LandspotEstates';

class House extends Component {

    state = {
        userAction: null,
        userActionData: null,
        company: null,
        path: '',
        selectedHouse: null,
        selectedFacadeIndex: 0,
        isShortlisted: false
    };

    componentDidMount() {
        let resultsUrl = '';
        const {state} = this.props.location;
        if (state) resultsUrl = state.resultsUrl;

        const {houseId} = this.props.match.params;
        const {basePath} = this.props.catalogue;
        const housePath = basePath + '/' + houseId;
        const path = resultsUrl || basePath;

        this.setState({path});

        if (houseId) {
            this.getHouseOptions(housePath);
        }
    }

    getHouseOptions = (housePath) => {
        axios.get(housePath).then((response) => {
            this.setState({
                company: response.data.house.range.builder_company,
                selectedHouse: response.data.house,
                isShortlisted: response.data.is_shortlisted
            });
        });
    };

    shortlistHouse() {
        const {houseId} = this.props.match.params;

        axios.post('/home/toggle-house-shortlist/' + houseId).then((response) => {
            this.setState({
                isShortlisted: response.data.shortlistHouseIds.includes(parseInt(houseId))
            });
        });
    }

    backToResults = () => {
        const url = this.props.catalogue.url ? this.props.catalogue.url : this.state.path;
        this.props.history.push(url);
    };

    selectFacade = (selectedFacadeIndex) => this.setState({selectedFacadeIndex});

    setUserAction = (action, actionData) => {
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
        const {selectedHouse, selectedFacadeIndex, path, company} = this.state;
        const {basePath} = this.props.catalogue;
        const {userAction, userActionData} = this.state;
        const contextValues = {
            basePath, selectedHouse, selectedFacadeIndex,
            backToResults: this.backToResults,
            selectFacade: this.selectFacade
        };

        return (
            <div className={'primary-container responsive-container'}>
                {selectedHouse
                    ?
                    <HouseContext.Provider value={contextValues}>
                        <DialogList userAction={userAction} userActionData={userActionData}
                                    setUserAction={this.setUserAction}/>
                        <CloseDiscoveryLink/>
                        <ContentPanel className='house-overview rtl'>
                            <div className='responsive-container house'>
                                <LeftPanel>
                                    <Media query="(min-width: 761px)">
                                        <PathNavLink className="back-nav" to={path}>
                                            <span><i className="fal fa-angle-left"/>Back to all floorplans</span>
                                        </PathNavLink>
                                    </Media>
                                    <div className='header'>
                                        <header className='ellipsis'>{selectedHouse.title}</header>
                                    </div>
                                    <Sidebar/>
                                    {(company.id && company.email) &&
                                    <button className="button primary"
                                            onClick={() => this.setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                                companyId: company.id,
                                            })}>Enquire
                                    </button>}
                                </LeftPanel>
                                <View/>
                                <Media query="(max-width: 760px)">
                                    <div className="mobile-buttons">
                                        <div className="buttons-group">
                                            {
                                                selectedHouse.canFindLots &&
                                                <PathNavLink
                                                    to={`${LandspotEstates.componentUrl}?depth=:depth&width=:width&from_house=:from_house`}
                                                    urlArgs={{
                                                        depth: selectedHouse.attributes.depth,
                                                        width: selectedHouse.attributes.width,
                                                        from_house: selectedHouse.id
                                                    }}
                                                    className='button default'
                                                >
                                                    Find lots
                                                </PathNavLink>
                                            }
                                        </div>
                                        <PathNavLink className="back-nav" to={path}>
                                            <span><i className="fal fa-angle-left"/>Back to all floorplans</span>
                                        </PathNavLink>
                                    </div>
                                </Media>
                            </div>
                        </ContentPanel>
                    </HouseContext.Provider>
                    :
                    <LoadingSpinner/>}
            </div>
        );
    }
}

export default connect((state => ({catalogue: state.discoveryCatalogue})))(House);