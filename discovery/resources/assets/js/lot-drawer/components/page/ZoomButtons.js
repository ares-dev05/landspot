import React from 'react';
import PropTypes from 'prop-types';

const ZoomButtons = ({setZoom}) => {
    return <div className='zoom-buttons'>
        <button type="button" className='button transparent' title='Zoom out' onClick={() => setZoom(5)}>
            <i className="landspot-icon plus"/>
        </button>
        <button type="button" className='button transparent' title='Zoom in' onClick={() => setZoom(-5)}>
            <i className="landspot-icon minus"/>
        </button>
    </div>;
};

ZoomButtons.propTypes = {
    setZoom: PropTypes.func.isRequired,
};

export default ZoomButtons;