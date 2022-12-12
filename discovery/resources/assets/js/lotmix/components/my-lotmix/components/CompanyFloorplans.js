import React from 'react';
import PropTypes from 'prop-types';
import {getImageForMedia} from '~/helpers';
import {Link} from 'react-router-dom';

const HouseOptions = ({beds, cars, bathrooms}) => {
    const item = (icon, text) => (
        <li>
            <i className={`landspot-icon ${icon}`} aria-hidden="true"/>
            <span>{text}</span>
        </li>
    );
    return (
        <ul className="item-options">
            {beds > 0 && item('bedroom', beds)}
            {cars > 0 && item('car-park', cars)}
            {bathrooms > 0 && item('bathroom', bathrooms)}
        </ul>
    );
};

const CompanyFloorplans = ({houses, onHouseSelect, company}) => (
    <div className="floorplans">
        {houses.map(house => {
                const facade = house.facades[0];
                return (<div className="floorplan" key={house.id} onClick={() => onHouseSelect(house)}>
                    <div className="floorplan-content">
                        <div className="floorplan-image">
                            <div className="company-logo"
                                 style={{
                                     backgroundImage: `url('${getImageForMedia(
                                         facade.mediumImage,
                                         facade.largeImage,
                                         true
                                     )}')`
                                 }}/>
                        </div>
                        <div className="floorplan-description">
                            <p className="floorplan-title">{house.title}</p>
                            <HouseOptions {...house}/>
                        </div>
                    </div>
                </div>);
            }
        )}
        <div className="floorplan catalogue">
            <div className="floorplan-content">
                <p className="catalogue-title">Floorplans Catalogue</p>
                <p className="catalogue-description">Browse leading builders to find the perfect floorplan for your family</p>
                <Link
                    className="button default"
                    to={`/discovery/company/${company.id}`}
                >
                    Browse now
                </Link>
            </div>
        </div>
    </div>
);

CompanyFloorplans.propTypes = {
    houses: PropTypes.array.isRequired,
    onHouseSelect: PropTypes.func.isRequired
};

export default CompanyFloorplans;
