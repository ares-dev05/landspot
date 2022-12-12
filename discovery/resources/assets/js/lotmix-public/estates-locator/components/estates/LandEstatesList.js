import React from 'react';
import PropTypes from 'prop-types';
import {EstateLocator} from '../../EstateLocator';

const LandEstatesList = ({estates, state}) => {
    const estateCount = estates ? estates.length : 0;

    const getEstateLink = ({suburb_slug,slug}) => (
        [
            EstateLocator.topLevelUrl,
            state,
            suburb_slug,
            slug
        ].join('/') + '/'
    );

    return (
        <div className="estate-results">
            <div className="results-header">
                <span className="count">
                    {estateCount + ' result' + (estateCount === 1 ? '' : 's')}
                </span>
                {/*<span className="sort">
                    Sort estates by
                </span>*/}
            </div>
            <div className="estate-cards">
                {estates.map((estate, index) => (
                    <a className="estate-card" key={index} href={getEstateLink(estate)}>
                        <span className="name">
                            {estate.name}
                        </span>
                        <div className="logo"
                             style={{backgroundImage: `url('${estate.smallImage}')`}}/>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default LandEstatesList;

LandEstatesList.propTypes = {
    estates: PropTypes.array.isRequired,
    state: PropTypes.string.isRequired,
};