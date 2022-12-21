import React from 'react';
import PropTypes from 'prop-types';

const ShoppingIcon = ({active, color}) => (
    <svg
        width="30px"
        height="30px"
        viewBox="0 0 30 30"
        className="amenity-icon"
    >
        <defs>
            <polygon
                id="sopping-icon-path"
                points="0 -0.0002 11.9997 -0.0002 11.9997 16.3136 0 16.3136"
            ></polygon>
        </defs>
        <g
            stroke="none"
            strokeWidth="1"
            fill={active ? color : '#FFFFFF'}
            fillRule="evenodd"
        >
            <g transform="translate(-47.000000, -513.000000)">
                <g transform="translate(38.000000, 229.000000)">
                    <g transform="translate(0.000000, 84.000000)">
                        <g transform="translate(10.000000, 201.000000)">
                            <g>
                                <circle
                                    stroke={color}
                                    cx="14"
                                    cy="14"
                                    r="14"
                                ></circle>
                                <g transform="translate(8.000000, 5.000000)">
                                    <mask id="shopping-mask" fill="white">
                                        <use xlinkHref="#sopping-icon-path"></use>
                                    </mask>
                                    <g></g>
                                    <path
                                        d="M3.8397,3.3456 C3.8397,2.1586 4.8057,1.1926 5.9937,1.1926 C7.1817,1.1926 8.1477,2.1586 8.1477,3.3456 L8.1477,4.5866 L3.8397,4.5866 L3.8397,3.3456 Z M11.9997,4.5866 L9.3387,4.5866 L9.3387,3.3456 C9.3387,1.5006 7.8387,-0.0004 5.9937,-0.0004 C4.1497,-0.0004 2.6487,1.5006 2.6487,3.3456 L2.6487,4.5866 L-0.0003,4.5866 L-0.0003,16.3136 L11.9997,16.3136 L11.9997,4.5866 Z"
                                        fill={active ? '#FFFFFF' : color}
                                        mask="url(#shopping-mask)"
                                    ></path>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

ShoppingIcon.propTypes = {
    active: PropTypes.bool,
    color: PropTypes.string
};
ShoppingIcon.defaultProps = {
    active: false,
    color: '#1A9280'
};

export default ShoppingIcon;
