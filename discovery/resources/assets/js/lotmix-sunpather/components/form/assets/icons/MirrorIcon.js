import React from 'react';

const MirrorIcon = ({className}) => {
    return(
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.2 126.5" className={className}>
            <polygon className="cls-1" fill='#e5f4f2' points="59.8 0.5 0 100.5 59.5 100.5 59.8 0.5"/>
            <polygon className="cls-2" fill='#3ac87c' points="67.3 0.5 127.2 100.5 67.6 100.5 67.3 0.5"/>
            <polygon className="cls-2" fill='#3ac87c'
                     points="52.6 109.5 52.6 104.5 41.6 115.5 52.6 125.5 52.6 121.5 74.6 121.5 74.6 126.5 85.6 115.5 74.6 104.5 74.6 109.5 52.6 109.5"/>
            <line className="cls-3" fill='none' stroke='#3ac87c' strokeMiterlimit='10' strokeWidth='0.75px'
                  strokeDasharray='4 4' x1="63.1" x2="63.1" y2="106"/>
        </svg>
    );
}

export default MirrorIcon;