import React from 'react';
import PropTypes from 'prop-types';
import UserAction from '../../constants';
import {PathNavLink} from '~/helpers';
import {LandspotEstates} from '../../../landspot/LandspotEstates';

class LotCard extends React.Component {
    static propTypes = {
        globalSwitch: PropTypes.bool,
        setGlobalSwitch: PropTypes.func,
        displayLocationLabel: PropTypes.string,
        displayLocationCallback: PropTypes.func,
        setUserAction: PropTypes.func.isRequired,
        estateCard: PropTypes.bool,
        estate: PropTypes.object
    };

    static defaultProps = {
        displayLocationCallback: () => {
        },
        setGlobalSwitch: () => {
        },
        globalSwitch: false,
        displayLocationLabel: '',
        estateCard: false,
        estate: {}
    };


    state = {
        showMore: false
    }

    localSwitchClick(state, updateState) {
        if (state) {
            updateState(false);
        }
    }

    globalSwitchClick(state, updateState) {
        if (!state) {
            updateState(true);
        }
    }

    render() {
        const setGlobalSwitch = (state) => {
            this.props.setGlobalSwitch(state);
        };
        const {displayLocationLabel, estate, globalSwitch} = this.props;
        const {showMore} = this.state;
        const basePath = LandspotEstates.componentUrl;

        const showLength = 315;
        let descriptionLength = 0;
        let shownDescription,
            cropEstateContent;

        if (estate.description) {
            descriptionLength = estate.description.length;
            shownDescription = showMore ? estate.description : estate.description.slice(0, showLength);
            cropEstateContent = descriptionLength >= showLength;
        }

        return (
            <React.Fragment>
                <div className='estate-info'>
                    <div className="button-back">
                        <PathNavLink className="back-nav"
                                     to={basePath}>
                            <i className="fal fa-arrow-left"/>
                            <span>Back to all Estates</span>
                        </PathNavLink>
                    </div>
                    <div className='estate-content'>
                        <div className="information-wrap">
                            <div className={`estate-image ${showMore ? 'show-more' : 'show-less'}`}>
                                <img alt="logo" src={estate.smallImage}/>
                            </div>
                            <div className='estate-signature'>
                                <div className='estate-name'>{estate.name || 'No estate name'}</div>
                                <div className='estate-description'>
                                    {`${shownDescription || 'There is no description yet'}`}
                                    {cropEstateContent
                                        ? <span className='more-less'
                                                onClick={
                                                    () => this.setState({showMore: !showMore})}>
                                                {showMore ? <span> Read less</span> : ' Read more'}
                                            <i className={`fal fa-angle-${showMore ? '' : 'down'}`}/>
                                            </span>
                                        : ''}
                                </div>
                            </div>
                        </div>

                        <hr className='line'/>

                        <div className={`estate-contacts ${showMore ? 'show-more' : 'show-less'}`}>
                            {estate.address && (
                                <div className='estate-website'>
                                    <div
                                        className='card-label-header'>Address
                                    </div>
                                    <div className='website'>{estate.address}</div>
                                </div>)
                            }
                            {false && estate.website && estate.contacts
                            && (<div className='estate-contact'>
                                <div className='card-label-header'>Contact</div>
                                <div className="estate-contact-details">
                                    <div className='email'>
                                        {estate.website &&
                                        <a target="_blank" href={estate.email}>email@email.com</a>}
                                    </div>
                                    <div className='phone'>
                                        <a href={`tel:${estate.contacts}`}>{estate.contacts}</a>
                                    </div>
                                </div>
                            </div>)
                            }
                        </div>
                        <div className={`button-wrapper ${showMore ? 'show-more-button' : 'show-less'}`}>
                            {estate.id && (
                                <div className='enquire-button-wrap'>
                                    <button className='button primary'
                                            onClick={() => this.props.setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                                estateId: estate.id
                                            })}
                                    >Enquire
                                    </button>
                                </div>
                            )}
                            {displayLocationLabel &&
                            <div className='display-location-wrap'>
                                <button className='button default' onClick={() => {
                                    this.props.displayLocationCallback();
                                }}>{displayLocationLabel}</button>
                            </div>
                            }
                        </div>
                        {cropEstateContent
                            ? <span className="more-less"
                                    onClick={() => this.setState({showMore: !showMore})}>
                                    {showMore ? ' Read less' : ''}
                                <i className={`fal fa-angle-${showMore ? 'up' : ''}`}/></span>
                            : ''}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default LotCard;