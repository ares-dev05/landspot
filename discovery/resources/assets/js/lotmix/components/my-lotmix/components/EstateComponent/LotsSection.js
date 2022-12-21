import React from 'react';
import PropTypes from 'prop-types';
import {PathNavLink} from '~/helpers';
import CompaniesCatalogue from '~/lotmix/components/discovery/CompaniesCatalogue.js';
import classnames from 'classnames';
import {LotPackages} from '~/landspot/LotPackages';
import UserAction from '~/lotmix/components/discovery/constants';

const LotsSection = ({lots, estateId, estate,showHeader, shortListLots, shortlistToggle,setUserAction}) => (
    <div className="lots-section">
        {showHeader && <h2 className="estate-header">Available Lots</h2>}
        <div className="lots">
            {lots.map(({id, drawer_data, drawerTheme, lotImage, area, lot_number, depth, frontage, title_date, stage_id, lot_package}) => {
                const lotRotation = (drawer_data && drawer_data.rotation || 0) - 45;

                const {background_image, theme} = drawerTheme || {};
                const {uploadedFile, backgroundColor} = theme && JSON.parse(theme) || {};
                const secondaryBg = (uploadedFile === null && background_image && `url('${background_image}')`)
                    || backgroundColor
                    || null;

                return (
                    <div key={id} className="lot">
                        <i className="fas fa-location-arrow"
                           style={{transform: `rotate(${lotRotation}deg)`}}/>
                        <i className={classnames('fa-heart', 'fa-2x', shortListLots.includes(id) ? 'fas' : 'far')}
                           onClick={() => shortlistToggle({id: id})}/>
                        <div
                            className="image-block">
                            <div className="lot-image"
                                 style={{backgroundImage: lotImage ? `url('${lotImage}')` : false}}/>
                            <div className="lot-background" style={{background: secondaryBg, backgroundSize: 'cover'}}/>
                        </div>
                        <div className="content">
                            <p className="lot-name">LOT {lot_number} - {area}m2</p>
                            <p className="lot-description">
                                Width: {frontage}m Length: {depth}m
                                <br/>
                                Title Date: {title_date}
                            </p>
                            <div className="footer-buttons">
                                <PathNavLink
                                    className="button default"
                                    to={`${CompaniesCatalogue.componentUrl}?width=${parseFloat(frontage)}&depth=${depth}`}>
                                    Floorplans
                                </PathNavLink>
                               {/* {
                                    lot_package.length ?
                                        <PathNavLink
                                            className="button default"
                                            to={LotPackages.componentUrl + '?stage_id=:stage_id&lot_id=:lot_id'}
                                            urlArgs={{
                                                estateId,
                                                lot_id: id,
                                                stage_id: stage_id
                                            }}>
                                            Packages
                                        </PathNavLink> : ''
                                }*/}
                                <button className="button primary"
                                        onClick={() => setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                            estate_id: estate.id
                                        })}>Enquire
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

LotsSection.propTypes = {
    lots: PropTypes.array.isRequired,
    estateId: PropTypes.number.isRequired,
    showHeader: PropTypes.bool,
    shortListLots: PropTypes.array.isRequired,
    shortlistToggle: PropTypes.func.isRequired
};

LotsSection.defaultProps = {
    showHeader: true
};

export default LotsSection;
