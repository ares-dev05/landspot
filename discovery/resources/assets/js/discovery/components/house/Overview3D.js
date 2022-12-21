import React from 'react';
import {Redirect} from 'react-router-dom';
import {HouseContext} from '../../House';

const Overview3D = () => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {overview3DUrl}}) =>
                <iframe
                    className='overview-3d'
                    src={overview3DUrl}
                    allowFullScreen='allowfullscreen'
                    frameBorder='0'
                />
        }
    </HouseContext.Consumer>
);

export default Overview3D;