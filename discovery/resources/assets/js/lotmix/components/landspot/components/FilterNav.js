import React from 'react';
import {clickHandler} from '~/helpers';
import PropTypes from 'prop-types';

const FilterNav = ({displayMap, setMapState}) => (
    <nav className='filter-nav' role="navigation">
        <a className={displayMap ? null : 'active'}
           onClick={e => clickHandler(e, () => setMapState(false))}>
            <i className="landspot-icon image"/>Image
        </a>
        <a className={displayMap ? 'active' : null}
           onClick={e => clickHandler(e, () => setMapState(true))}>
            <i className="landspot-icon map-marker"/>Map view
        </a>
    </nav>
);

FilterNav.propTypes = {
    displayMap: PropTypes.bool.isRequired,
    setMapState: PropTypes.func.isRequired
};

export default FilterNav;