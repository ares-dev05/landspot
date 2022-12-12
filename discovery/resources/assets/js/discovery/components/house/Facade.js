import React from 'react';
import {getImageForMedia} from '~/helpers';
import {HouseContext} from '../../House';

const Facade = () => (
    <HouseContext.Consumer>
        {
            ({selectedFacadeIndex, selectFacade, selectedHouse: {facades}}) => {
                if (!facades.length) {
                    return null;
                }

                const facade = facades[selectedFacadeIndex];

                return (
                    <React.Fragment>
                        <FacadeImage url={getImageForMedia(
                            facade.mediumImage,
                            facade.largeImage, true
                        )}/>
                    </React.Fragment>
                );
            }
        }
    </HouseContext.Consumer>
);

const FacadeImage = ({url}) => (
    <React.Fragment>
        <div className='image-overview hidden-tablet' style={{backgroundImage: `url('${url}')`}}/>
        <img src={url} className='tablet-image-overview hidden-desktop'/>
    </React.Fragment>
);

export default Facade;