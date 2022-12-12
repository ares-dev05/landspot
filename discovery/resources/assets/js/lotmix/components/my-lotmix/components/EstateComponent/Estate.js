import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as actions from '../../store/estate/actions';

import axios from 'axios';
import classnames from 'classnames';
import {withAlert} from 'react-alert';
import {isEmpty, isEqual} from 'lodash';
import {LoadingSpinner, PathNavLink} from '~/helpers';

import EstateInto from './EstateInfo';
import {MyLotmix} from '../../MyLotmix';
import OfferBlock from '~/helpers/OfferBlock';
import AmenitySection from './AmenitySection';
import GallerySection from './GallerySection';
import CompanyFloorplans from '../CompanyFloorplans';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';

const iconColor = {
    education: '#29c97c',
    health: '#29c97c',
    shopping: '#29c97c',
    dining: '#29c97c',
    clubs: '#29c97c'
};

class Estate extends Component {
    static componentUrl = '/home/estate/:estateId';
    static propTypes = {
        getEstateInfo: PropTypes.func.isRequired,
        toggleLotToShortlist: PropTypes.func.isRequired,
        preloader: PropTypes.bool.isRequired,
        estate: PropTypes.object.isRequired,
        shortlistLotsIds: PropTypes.array
    };

    static defaultProps = {
        shortlistLotsIds: []
    };

    state = {
        search: '',
        suggestions: [],
        userAction: null,
        userActionData: null
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

    componentDidMount() {
        const {
            getEstateInfo,
            match: {params}
        } = this.props;
        getEstateInfo({id: params.estateId});
    }

    onHouseSelect = house => {
        const {pathname, search} = this.props.location;
        this.props.history.push('/discovery/overview/' + house.id,
            {resultsUrl: pathname + search}
        );
    };

    onTextChanged = async (e) => {
        const search = e.target.value;
        this.setState({
            ...this.state,
            search
        });
        if (search.length) {
            const response = await axios.post('land-estates/estate-autocomplete', {
                search
            });
            this.setState({
                ...this.state,
                suggestions: response.data || []
            });
        } else {
            this.setState({
                ...this.state,
                search,
                suggestions: []
            });
        }
    };

    render() {
        const date = new Date();
        const currentYear = date.getFullYear();
        const {search, userAction, userActionData, suggestions} = this.state;
        const {preloader, estate, randomHouses, company} = this.props;

        return (
            <div className="lotmix-estate-container">
                <DialogList userAction={userAction} userActionData={userActionData} setUserAction={this.setUserAction}/>
                {preloader && <LoadingSpinner className="overlay"/>}
                {!isEmpty(estate) && (
                    <div className="lotmix-estate">
                        <div className="estate-navigation-section">
                            <div className="estate-navigation">
                                <div className="button-back">
                                    <PathNavLink className="back-nav"
                                                 to={MyLotmix.componentUrl}>
                                        <i className="fal fa-arrow-left"/>
                                        <span>Back to home</span>
                                    </PathNavLink>
                                </div>

                                <div className="estate-autocomplete-input">
                                    <i className="far fa-search"/>
                                    <input value={search}
                                           onChange={this.onTextChanged}
                                           type="text"
                                           placeholder="Search estates"/>
                                    {suggestions.length !== 0 && (
                                        <div className="list">
                                            {suggestions.map(({id, name}) => (
                                                <a key={id}
                                                   href={`/home/estate/${id}`}
                                                   className="item"
                                                >{name}</a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="estate-info-section">
                            <EstateInto estate={estate} setUserAction={this.setUserAction}/>
                            <div className="estate-contact-details">
                                <div className="address">
                                    <h3 className="footer-title">Address</h3>
                                    <p>{estate.address}</p>
                                </div>
                                <div className="contact">
                                    <p>
                                        {estate.website ? (
                                            <a href={estate.website}>{estate.website}</a>
                                        ) : (
                                            'No website address.'
                                        )}
                                    </p>
                                    <p>{estate.contacts}</p>
                                </div>
                            </div>
                        </div>
                        <div className="houses-section">
                            <div className={classnames('houses-header', 'dots-top-left')}>Match house to land in {estate.name}
                                estate
                            </div>
                            <div className="houses-description">Browse leading builders to find the perfect floorplan
                                for your family
                            </div>
                            <CompanyFloorplans houses={randomHouses} company={company}
                                               onHouseSelect={this.onHouseSelect}/>
                            <OfferBlock
                                header='Looking for the perfect package? '
                                description='Start your building journey with the guidance of leading builders'
                                buttonText='Get Started Now'
                                link={Estate.enquireOnceUrl}
                            />
                        </div>
                        <div className="estate-amenity-section">
                            <AmenitySection estate={estate} iconColor={iconColor}/>
                            {estate && !!estate.estate_gallery.length && (
                                <GallerySection gallery={estate.estate_gallery}/>
                            )}
                            <OfferBlock
                                header='Looking to build your dream home in this area?'
                                description='Find the perfect builder on Lotmix'
                                buttonText='Join Now'
                                link={Estate.enquireOnceUrl}
                            />
                        </div>
                        <div className="estate-advertisement-section">
                            <div className="estate-advertisement-info">
                                <div className="advertisement-description">
                                    <div className={classnames('advertisement-description-header', 'dots-top-left')}>Why
                                        buy in Victoria
                                    </div>
                                    <div className="advertisement-description-text">The grand community park at the
                                        entranceway offers residents the perfect introduction to Savana, which boasts a
                                        masterplan designed to enhance a neighbourly, community feel. This estate is
                                        inclusive; it offers a full range of homes, from grand designs on large blocks
                                        to homes that offer low maintenance and real value. No matter who you are,
                                        Savana will feel like home.
                                    </div>
                                </div>
                                <div className="advertisement-image"/>
                            </div>
                            <OfferBlock
                                header='Start your building journey the easy way!'
                                description='Join Lotmix today!'
                                buttonText='Join Now'
                                link={Estate.enquireOnceUrl}
                            />
                        </div>
                        <div className="lotmix-footer">
                            <div className="footer-container">
                                <a className="footer-logo" href="/" title="Lotmix"/>
                                <p className="footer-text">
                                    Lotmix is run and operated by Landconnect Global Pty Ltd. Landconnect has been
                                    servicing new home
                                    builders and developers with smart and simple technology throughout Australia since
                                    2014.
                                </p>
                                <div className="footer-links">
                                    <a href="/tos/">Terms of Service</a>
                                    <a href="#">Contact Us</a>
                                </div>
                                <p className="footer-copyright">© {currentYear} Lotmix </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const EstateInstance = withAlert(
    connect(
        state => ({...state.myLotmixEstate}),
        actions
    )(Estate)
);

export {EstateInstance, Estate};
