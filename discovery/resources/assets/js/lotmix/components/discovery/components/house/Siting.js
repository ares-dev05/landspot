import React from 'react';
import {HouseContext} from '~/discovery/House';

const Siting = () => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {siting}}) => (
                <div className='floorplans'>
                    <SitingImage url={siting.image}/>
                </div>
            )

        }
    </HouseContext.Consumer>
);
export default Siting;

const SitingImage = ({url}) => (
    <React.Fragment>
        <div className='hidden-tablet' style={{backgroundImage: `url('${url}')`}}/>
        <img src={url} className='hidden-desktop'/>
    </React.Fragment>
);
