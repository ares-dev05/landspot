import React from 'react';
import Media from 'react-media';
import PropTypes from 'prop-types';
import UserAction from '../../constants';
import {isEqual, isPlainObject, isEmpty} from 'lodash';

class CompanyCard extends React.Component {
    static propTypes = {
        globalSwitch: PropTypes.bool,
        setGlobalSwitch: PropTypes.func,
        displayLocationLabel: PropTypes.string,
        displayLocationCallback: PropTypes.func,
        setUserAction: PropTypes.func.isRequired,
        estateCard: PropTypes.bool,
        estate(props, propName) {
            if (!props['company'] && !isPlainObject(props[propName])) {
                return new Error(`Please provide company or ${propName} object!`);
            }
        },
        company(props, propName) {
            if (!props['estate'] && !isPlainObject(props[propName])) {
                return new Error(`Please provide estate or ${propName} object!`);
            }
        },
    };

    static defaultProps = {
        displayLocationCallback: () => {
        },
        setGlobalSwitch: () => {
        },
        globalSwitch: false,
        displayLocationLabel: '',
        estateCard: false
    };

    state = {
        showMore: false
    };

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

        const {showMore} = this.state;
        const {displayLocationLabel, estate = {}, company = {}, globalSwitch} = this.props;

        const showLength = 315;
        let fullDescription = company.description || estate.description;
        let descriptionLength = 0;
        let shownDescription, cropEstateContent;

        if (fullDescription) {
            descriptionLength = fullDescription.length;
            shownDescription = showMore ? fullDescription : fullDescription.slice(0, showLength);
            cropEstateContent = descriptionLength >= showLength;
        }

        return (
            <React.Fragment>
                <div className='company-card'>
                    <div className='card-header'>
                        <div className='image-wrap'>
                            <div className='company-image'>
                                <img alt="logo" src={estate.smallImage || company.company_logo}/>
                            </div>
                        </div>
                        <div className='information-wrap'>
                            <div className='company-signature'>
                                <div className='company-name'>{estate.name || company.name || 'No company name'}</div>
                                <div className='company-description'>
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
                            <div className='company-contacts'>
                                {
                                    (estate.address || company.website) && (
                                        <div className='company-website'>
                                            <div
                                                className='card-label-header'>{isEmpty(company) ? 'ADDRESS' : 'WEBSITE'}</div>
                                            <div
                                                className='website'>{estate.address ||
                                            <a target="_blank" href={company.website}>{company.website}</a>}</div>
                                        </div>)
                                }
                                {
                                    ((estate.website && estate.contacts) || (company.email && company.phone))
                                    && (<div className='company-contact'>
                                        <div className='card-label-header'>CONTACT</div>
                                        <div className='email'>
                                            {estate.website &&
                                            <a target="_blank" rel="noreferrer" href={estate.website}>{estate.website}</a>}
                                        </div>
                                        <div
                                            className='phone'>
                                            <a href={`tel:${estate.contacts || company.phone}`}>{estate.contacts || company.phone}</a>
                                        </div>
                                    </div>)
                                }
                            </div>
                            {
                                displayLocationLabel &&
                                <div className='display-location-wrap'>
                                    <button className='button default' onClick={() => {
                                        this.props.displayLocationCallback();
                                    }}>{displayLocationLabel}</button>
                                </div>
                            }
                        </div>
                        {((company.id && company.email) || estate.id)
                        && (<div className='enquire-button-wrap'>
                            <button className='button primary'
                                    onClick={() => this.props.setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                        companyId: company.id,
                                    })}
                            >Enquire
                            </button>
                        </div>)}
                    </div>
                    <Media query='(max-width: 760px)'>

                        <div className='card-footer'>
                            <div className='switch'>
                                <div onClick={() => {
                                    this.globalSwitchClick(globalSwitch, setGlobalSwitch);
                                }}
                                     className={'switch-item' + (globalSwitch ? ' switch-item-active' : '')}>
                                    {Object.keys(estate).length ? 'Lots' : 'Floorplans'}
                                </div>
                                <div onClick={() => {
                                    this.localSwitchClick(globalSwitch, setGlobalSwitch);
                                }}
                                     className={'switch-item' + (!globalSwitch ? ' switch-item-active' : '')}>
                                    {Object.keys(estate).length ? 'Estate Info' : 'Builders Info'}
                                </div>
                            </div>
                            {
                                !globalSwitch &&
                                (
                                    <div className='expanded'>
                                        <div
                                            className='company-name'>{estate.name || company.name || 'No company name'}</div>
                                        <div className='company-description'>{company.description
                                        || estate.description
                                        || 'There is no description yet'}</div>
                                        {(estate.address || company.website) &&
                                        (<React.Fragment>
                                            <div
                                                className='card-label-header'>{isEmpty(company) ? 'ADDRESS' : 'WEBSITE'}</div>
                                            <div
                                                className='website'>{estate.address ||
                                            <a target="_blank" href={company.website}>{company.website}</a>}</div>
                                        </React.Fragment>)}
                                        {
                                            ((estate.website && estate.contacts) || (company.email && company.phone)) &&
                                            <React.Fragment>
                                                <div className='card-label-header'>CONTACT</div>
                                                <div
                                                    className='email'>
                                                    {estate.website &&
                                                    <a target="_blank" rel="noreferrer" href={estate.website}>{estate.website}</a>}
                                                </div>
                                                <div
                                                    className='phone'>
                                                    <a href={`tel:${estate.contacts || company.phone}`}>{estate.contacts || company.phone}</a>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>
                                )
                            }
                        </div>

                    </Media>
                </div>
            </React.Fragment>
        );
    }
}

export default CompanyCard;