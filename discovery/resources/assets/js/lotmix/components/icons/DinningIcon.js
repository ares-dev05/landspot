import React from 'react';
import PropTypes from 'prop-types';

const DinningIcon = ({active, color}) => (
    <svg
        width="30px"
        height="30px"
        viewBox="0 0 30 30"
        className="amenity-icon"
    >
        <defs>
            <polygon
                id="dinning-path"
                points="0 0.164105263 19.9997895 0.164105263 19.9997895 2.10515789 0 2.10515789"
            ></polygon>
        </defs>
        <g
            stroke="none"
            strokeWidth="1"
            fill={active ? color : '#FFFFFF'}
            fillRule="evenodd"
        >
            <g transform="translate(-47.000000, -564.000000)">
                <g transform="translate(38.000000, 229.000000)">
                    <g transform="translate(0.000000, 84.000000)">
                        <g transform="translate(10.000000, 252.000000)">
                            <g>
                                <circle
                                    stroke={color}
                                    cx="14"
                                    cy="14"
                                    r="14"
                                ></circle>
                                <g transform="translate(4.000000, 7.000000)">
                                    <g transform="translate(0.000000, 9.632211)">
                                        <mask id="dinning-mask" fill="white">
                                            <use xlinkHref="#dinning-path"></use>
                                        </mask>
                                        <g></g>
                                        <path
                                            d="M19.2103158,2.10515789 L0.789263158,2.10515789 C0.353473684,2.10515789 -0.000210526316,1.75147368 -0.000210526316,1.31568421 L-0.000210526316,0.953578947 C-0.000210526316,0.517789474 0.353473684,0.164105263 0.789263158,0.164105263 L19.2103158,0.164105263 C19.6471579,0.164105263 19.9997895,0.517789474 19.9997895,0.953578947 L19.9997895,1.31568421 C19.9997895,1.75147368 19.6471579,2.10515789 19.2103158,2.10515789"
                                            fill={active ? '#FFFFFF' : color}
                                            mask="url(#dinning-mask)"
                                        ></path>
                                    </g>
                                    <path
                                        d="M9.99978947,1.98515789 C5.89347368,1.98515789 2.47873684,4.93147368 1.74294737,8.82515789 L18.2566316,8.82515789 C17.5208421,4.93147368 14.1071579,1.98515789 9.99978947,1.98515789"
                                        fill={active ? '#FFFFFF' : color}
                                    ></path>
                                    <path
                                        d="M11.1695789,1.16989474 C11.1695789,1.81515789 10.6453684,2.33831579 10.0001053,2.33831579 C9.35378947,2.33831579 8.83063158,1.81515789 8.83063158,1.16989474 C8.83063158,0.523578947 9.35378947,0.000421052632 10.0001053,0.000421052632 C10.6453684,0.000421052632 11.1695789,0.523578947 11.1695789,1.16989474"
                                        fill={active ? '#FFFFFF' : color}
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

DinningIcon.propTypes = {
    active: PropTypes.bool,
    color: PropTypes.string
};
DinningIcon.defaultProps = {
    active: false,
    color: '#1A9280'
};

export default DinningIcon;
