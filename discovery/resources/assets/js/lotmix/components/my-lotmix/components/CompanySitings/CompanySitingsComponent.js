import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {HouseOptions} from '~/helpers.js';
import Media from 'react-media';
import SitingSVG from './SitingSVG';
import {PopupModal} from '~/popup-dialog/PopupModal';

const CompanySitingsComponent = ({sitings}) => {
    const [imagePopup, setImagePopup] = useState(false);
    const [activeTab, setTub] = useState(0);

    if (!sitings.length) {
        return (
            <div className="my-sitings-section">
                <div className="siting">
                    <p>There are no sitings for this company</p>
                </div>
            </div>
        );
    }

    const activeSiting = sitings[activeTab];
    const {lot_number, street, lot_area, options, facade} = activeSiting;
    const optionsArray = (options) ? options.split(' / ') : [];
    const site_coverage = Math.round(activeSiting.site_coverage);

    const sitingImageUrl = activeSiting.imageURL
        ? activeSiting.imageURL
        : null;

    const renderSiting = function () {
        return (
            <div className="siting">
                <div className="siting-info">
                    {
                        (activeSiting.sittingHouseByTitle && activeSiting.sittingHouseByTitle.attributes) && (
                            <ul className="siting-options">
                                <HouseOptions {...activeSiting.sittingHouseByTitle.attributes} />
                            </ul>
                        )

                    }

                    <div className="siting-area-info">
                        <div className="siting-area-info-col">
                            <div>
                                LOT NO:
                                <br/>
                                <span className="siting-area-value">{lot_number}</span>
                            </div>
                            <div>
                                STREET NO:
                                <br/>
                                <span className="siting-area-value">{street}</span>
                            </div>
                            <div>
                                LOT AREA:
                                <br/>
                                <span className="siting-area-value">{lot_area}m<sup>2</sup></span>
                            </div>
                        </div>
                        <div className="siting-area-info-col">
                            <div>
                                SITE COVERAGE:
                                <br/>
                                <span className="siting-area-value">{site_coverage}%</span>
                            </div>
                            <div>
                                FACADE:
                                <br/>
                                <span className="siting-area-value">{facade}</span>
                            </div>
                        </div>
                    </div>
                    {
                        optionsArray.length > 0 &&
                        (
                            <div className="siting-options-selected">
                                <div className="siting-options-title">OPTIONS SELECTED:</div>
                                <ul className="siting-options-list">
                                    {
                                        optionsArray.map((option, index) =>
                                            <li key={index} className="siting-options-list-item">{option}</li>
                                        )
                                    }
                                </ul>
                            </div>
                        )
                    }
                </div>
                <div className="siting-image" onClick={() => {
                    setImagePopup(true);
                }}>
                    <SitingSVG url={sitingImageUrl} ratio={0.69}/>
                </div>
            </div>
        );
    };

    return (
        <div className="my-sitings-section">
            <Media query="(min-width: 761px)">
                {
                    imagePopup &&
                    <PopupModal
                        dialogClassName={'wide-popup'}
                        okButtonTitle={'Ok'}
                        title={activeSiting.house}
                        onOK={() => {
                            setImagePopup(false);
                        }}
                        onModalHide={() => {
                            setImagePopup(false);
                        }}
                        hideCancelButton
                    >
                        <div className='siting-image-modal-wrap'>
                            <SitingSVG url={sitingImageUrl} ratio={1.436}/>
                        </div>
                    </PopupModal>
                }
            </Media>
            <Media query='(min-width: 761px)'>
                <React.Fragment>
                    <ul className="my-sitings-tabs">
                        {sitings.map((siting, index) => (
                            <li className={`my-sitings-tabs_tab ${activeTab === index ? 'active' : ''}`}
                                onClick={() => setTub(index)}
                                key={index}>
                                {siting.house}
                            </li>))}
                    </ul>
                    {
                        renderSiting()
                    }
                </React.Fragment>
            </Media>
            <Media query="(max-width:760px)">
                <div className="my-sitings-tabs-vertical">
                    {sitings.map((siting, index) => (
                        <div className={`my-sitings-tabs-vertical_tab ${activeTab === index ? 'active' : ''}`}
                             onClick={() => setTub(index)}
                             key={index}>
                            <div className='my-siting-tab'>
                                <span className='tab-title'>{siting.house}</span>
                                <i className={'angle-down landspot-icon'} aria-hidden="true"/>
                            </div>
                            {
                                activeTab === index ? renderSiting() : null
                            }
                        </div>))}
                </div>
            </Media>
        </div>
    );
};

CompanySitingsComponent.propTypes = {
    sitings: PropTypes.array.isRequired
};

export default CompanySitingsComponent;