import React from 'react';
import {getImageForMedia} from '~/helpers';
import {HouseContext} from '../../House';

const Floorplan = () => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {floorplans}}) => (
                <div className='floorplans'>
                    {
                        floorplans.map(({id, largeImage}) => <FloorplanImage key={id}
                                                                             url={largeImage}/>)
                    }
                </div>
            )

        }
    </HouseContext.Consumer>
);
export default Floorplan;

const FloorplanImage = ({url}) => (
    <React.Fragment>
        <div className='hidden-tablet' style={{backgroundImage: `url('${url}')`}}/>
        <img src={url} className='hidden-desktop'/>
    </React.Fragment>
);
