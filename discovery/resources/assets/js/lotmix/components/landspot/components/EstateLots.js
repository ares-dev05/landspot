import React from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import * as actions from '../store/estate/actions';
import {formatCurrency} from '~/helpers';

import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import UserAction from '../../discovery/constants';
import {withRouter} from 'react-router-dom';

class EstateLots extends React.Component {
    static propTypes = {
        lots: PropTypes.array.isRequired,
        drawerThemes: PropTypes.object.isRequired
    };

    static columnsByName = {};


    static prepareColumnsByName(columns) {
        const columnsByName = {};
        columns.forEach((item, index) => {
            columnsByName[item['attr_name']] = {order: item['order'], index};
        });

        EstateLots.columnsByName = columnsByName;
    }

    render() {
        const {lots, drawerThemes} = this.props;

        return (
            <div>
                <Cards>
                    {lots && lots.map(lot => {
                        const {background_image, theme} = drawerThemes[lot.stageId] || {};
                        const {uploadedFile, backgroundColor} = theme && JSON.parse(theme) || {};
                        const secondaryBg = (
                                uploadedFile === null
                                && background_image
                                && `url('${background_image}')`
                            )
                            || backgroundColor
                            || null;
                        const lotRotation = (lot.lotRotation || 0);
                        return (
                            <CardImageItem
                                asBlock={true}
                                key={lot.id}
                                bgSize='contain'
                                bgImage={lot.image ? `url('${lot.image}')` : null}
                                secondaryBg={secondaryBg}
                                bgDefaultImage={true}
                                customContent={
                                    <div className="lot-card-content">
                                        <div className="north-icon"
                                             style={{transform: `rotate(${lotRotation}deg)`}}/>
                                        <button className='button primary lot-card-enquire'
                                                onClick={() => this.props.setUserAction(UserAction.SHOW_ENQUIRE_DIALOG, {
                                                    estateId: lot.estateId,
                                                    lotId: lot.id
                                                })
                                                }
                                        >Enquire
                                        </button>
                                        <div className="lot-title">
                                            <span>LOT {lot.number} - {lot.area}m<sup>2</sup></span>
                                            {lot.price && <span>{formatCurrency(lot.price)}</span>}
                                        </div>
                                        <div className="lot-footer">
                                            <div className="lot-params">
                                                <div className="lot-sizes">
                                                    <div className="lot-size-width">
                                                        <span
                                                            className="lot-header">Width:</span> {parseInt(lot.frontage)}m
                                                    </div>
                                                    <div className="lot-size-length">
                                                        <span
                                                            className="lot-header">Length:</span> {parseInt(lot.depth)}m
                                                    </div>
                                                </div>
                                                <div className="lot-title-date"><span
                                                    className="lot-header">Title Date:</span> {lot.titleDate}</div>
                                            </div>
                                            <a
                                                className="button default"
                                                href={`/floorplans/?depth=:${lot.depth}&width=:${lot.frontage}`}
                                                onClick={() => window.location = `/floorplans/?depth=${lot.depth}&width=${lot.frontage}`}
                                            >
                                                Floorplans that may fit
                                            </a>
                                        </div>
                                    </div>
                                }
                            />
                        );
                    })
                    }
                </Cards>
            </div>
        );
    }
}

export default withRouter(connect(state => ({
    estateData: state.landspotEstate
}), actions)(EstateLots));

