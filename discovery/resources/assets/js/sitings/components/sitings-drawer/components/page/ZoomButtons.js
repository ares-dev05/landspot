import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const ZoomButtons = ({ setZoom, disabled, previewHeight }) => {
    console.log('ZoomButtons', previewHeight)
    const bottomV = previewHeight == undefined? 60: previewHeight;
    return <div className={classnames('zoom-buttons', disabled && 'disabled')}
        style={{
            bottom: `${bottomV}px`
        }} >
        <button type="button" className='button transparent' title='Zoom out' onClick={() => setZoom(5)}>
            <i className="landconnect-icon plus" />
        </button>
        <button type="button" className='button transparent' title='Zoom in' onClick={() => setZoom(-5)}>
            <i className="landconnect-icon minus" />
        </button>
    </div>;
};

ZoomButtons.propTypes = {
    setZoom: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    previewHeight: PropTypes.number,
};

export default ZoomButtons;