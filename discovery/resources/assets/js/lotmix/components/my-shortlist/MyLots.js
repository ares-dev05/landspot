import React from 'react';
import PropTypes from 'prop-types';
import CompaniesCatalogue from '../discovery/CompaniesCatalogue';
import {LotPackages} from '~/landspot/LotPackages';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import {PathNavLink} from '~/helpers';
import UserAction from '~/lotmix/components/discovery/constants';

const MyLots = ({estates,setUserAction}) => (
    <div className="content">
        <div className="heading">
            My Lots
        </div>

        {estates.map(estate => (
            <React.Fragment key={estate.id}>
                <div
                    className="company-logo"
                    style={{
                        backgroundImage: `url('${estate.estate.smallImage ? estate.estate.smallImage : null}')`
                    }}
                />
                <Cards className="lots-grid">
                    {estate.short_list.map(list => {
                        const {lot,stage:{drawer_theme = {}}} = list;
                        const {backgroundColor,uploadedFile} = drawer_theme.theme && JSON.parse(drawer_theme.theme) || {};
                        const background = (uploadedFile === null && drawer_theme.backgroundImage &&
                            `url('${drawer_theme.backgroundImage}')`)
                            || backgroundColor || null;

                        const lotRotation = (lot.drawer_data && lot.drawer_data.rotation || 0) - 45;

                        return (
                            <CardImageItem
                                key={lot.id}
                                bgImage={`url('${lot.drawer_data.lotImage}')`}
                                secondaryBg={background}
                                bgSize='contain'
                                className={'lot'}
                                asBlock={true}
                                onClick={null}
                                title={null}
                                customContent={
                                    <div className='lot-content'>
                                        <i className="lot-location-icon fas fa-location-arrow"
                                           style={{transform: `rotate(${lotRotation}deg)`}}/>
                                        <div className='title'>{`LOT ${lot.lot_number} - ${lot.area}M2`}</div>
                                        <div>
                                            <span>
                                                <span className="important">Width:</span> {lot.frontage}m
                                            </span>
                                            <span>
                                                <span className="important">Length:</span> {lot.depth}m
                                            </span>
                                        </div>
                                        <div>
                                            <span>
                                                <span className="important">Title Date:</span> {lot.title_date}
                                            </span>
                                        </div>

                                        <div className='actions'>
                                            <PathNavLink
                                                className='button default'
                                                to={`${CompaniesCatalogue.componentUrl}?width=${parseFloat(lot.frontage)}&depth=${lot.depth}`}>
                                                Floorplans
                                            </PathNavLink>
                                        {/*    <PathNavLink
                                                className='button default'
                                                to={LotPackages.componentUrl + '?stage_id=:stage_id&lot_id=:lot_id'}
                                                urlArgs={{
                                                    estateId: estate.id,
                                                    lot_id: lot.id,
                                                    stage_id: lot.stage_id
                                                }}>
                                                Packages
                                            </PathNavLink>*/}

                                            <button className='button default'
                                                    onClick={() => setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                                        estate_id: estate.estate_id})}>
                                                Enquire
                                            </button>
                                        </div>
                                    </div>
                                }
                            />
                        );
                    })}
                </Cards>
            </React.Fragment>
        ))}
    </div>
);

MyLots.propTypes = {
    estates: PropTypes.array.isRequired
};
export default MyLots;
