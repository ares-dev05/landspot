import React from 'react';
import PropTypes from 'prop-types';

const HealthIcon = ({active, color}) => (
    <svg
        width="30px"
        height="30px"
        viewBox="0 0 30 30"
        className="amenity-icon"
    >
        <defs>
            <polygon
                id="health-path"
                points="0.000282352941 0.4768 16 0.4768 16 8.71115294 0.000282352941 8.71115294"
            ></polygon>
            <polygon
                id="health-path-1"
                points="0.815717647 0.245929412 13.4510118 0.245929412 13.4510118 8.47058824 0.815717647 8.47058824"
            ></polygon>
        </defs>
        <g
            stroke="none"
            strokeWidth="1"
            fill={active ? color : '#FFFFFF'}
            fillRule="evenodd"
        >
            <g transform="translate(-47.000000, -463.000000)">
                <g transform="translate(38.000000, 229.000000)">
                    <g transform="translate(0.000000, 84.000000)">
                        <g transform="translate(10.000000, 151.000000)">
                            <circle
                                stroke={color}
                                cx="14"
                                cy="14"
                                r="14"
                            ></circle>
                            <g transform="translate(6.000000, 6.000000)">
                                <g transform="translate(0.000000, 0.464659)">
                                    <mask id="health-mask-1" fill="white">
                                        <use xlinkHref="#health-path"></use>
                                    </mask>
                                    <g id="Clip-2"></g>
                                    <path
                                        d="M2.98287059,8.34127059 L4.77392941,3.30785882 L7.6304,8.71115294 L8.03887059,8.13891765 L10.3758118,8.13891765 L12.6111059,3.32668235 L14.6732235,8.13891765 L15.2642824,8.13891765 C15.7198118,7.22032941 16.0002824,6.24432941 16.0002824,5.23538824 C16.0002824,2.60762353 13.8685176,0.4768 11.2407529,0.4768 C9.98710588,0.4768 8.85016471,0.964329412 8.00028235,1.7568 C7.1504,0.964329412 6.01345882,0.4768 4.75981176,0.4768 C2.13110588,0.4768 0.000282352941,2.60762353 0.000282352941,5.23538824 C0.000282352941,6.32056471 0.326870588,7.36338824 0.842635294,8.34127059 L2.98287059,8.34127059 Z"
                                        fill={active ? '#FFFFFF' : color}
                                        mask="url(#health-mask-1)"
                                    ></path>
                                </g>
                                <g transform="translate(0.941176, 7.052894)">
                                    <mask id="health-mask" fill="white">
                                        <use xlinkHref="#health-path-1"></use>
                                    </mask>
                                    <g id="Clip-5"></g>
                                    <path
                                        d="M12.7893647,2.98098824 L11.6176,0.245929412 L10.3479529,2.98098824 L7.83312941,2.98098824 L6.50701176,4.83604706 L4.08912941,0.263811765 L3.05007059,3.18334118 L0.815717647,3.18334118 C3.17054118,6.31557647 7.05854118,8.47087059 7.05854118,8.47087059 C7.05854118,8.47087059 11.1150118,6.2224 13.4510118,2.98098824 L12.7893647,2.98098824 Z"
                                        fill={active ? '#FFFFFF' : color}
                                        mask="url(#health-mask)"
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

HealthIcon.propTypes = {
    active: PropTypes.bool,
    color: PropTypes.string
};
HealthIcon.defaultProps = {
    active: false,
    color: '#1A9280'
};

export default HealthIcon;
