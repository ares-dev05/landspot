import React from 'react';
import PropTypes from 'prop-types';

const EducationIcon = ({active, color}) => (
    <svg
        width="30px"
        height="30px"
        viewBox="0 0 30 30"
        className="amenity-icon"
    >
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g transform="translate(-47.000000, -323.000000)">
                <g transform="translate(38.000000, 229.000000)">
                    <g transform="translate(0.000000, 84.000000)">
                        <g transform="translate(10.000000, 11.000000)">
                            <g>
                                <circle
                                    stroke={color}
                                    fill={active ? color : '#FFFFFF'}
                                    cx="14"
                                    cy="14"
                                    r="14"
                                ></circle>
                                <g
                                    transform="translate(5.000000, 7.000000)"
                                    fill={active ? '#FFFFFF' : color}
                                >
                                    <polygon points="9 -0.0002 0 3.9088 9 7.8178 18 3.9088"></polygon>
                                    <path d="M8.9999,9.2301 L3.0119,6.6291 L3.0119,9.0851 C3.0119,10.7671 5.6929,13.2261 8.9999,13.2261 C12.3079,13.2261 14.9889,10.7671 14.9889,9.0851 L14.9889,6.6291 L8.9999,9.2301 Z"></path>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

EducationIcon.propTypes = {
    active: PropTypes.bool,
    color: PropTypes.string
};
EducationIcon.defaultProps = {
    active: false,
    color: '#1A9280'
};

export default EducationIcon;
