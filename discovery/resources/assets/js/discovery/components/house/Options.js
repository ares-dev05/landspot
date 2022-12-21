import React from 'react';
import {getImageForMedia} from '~/helpers';
import {HouseContext} from '../../House';

const Options = () => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {options, floorplans, attributes}}) => (
                <div>
                    <p>Available Options for {attributes.title}</p>
                    <ul>
                        {
                            options.map((option, index) =>
                                <li key={option.id}>
                                    {index + 1} {option.title}
                                    <img src={getImageForMedia(option.mediumImage, option.largeImage, true)}
                                         style={{
                                             display: 'block',
                                             width: '100%'
                                         }}
                                    />
                                </li>
                            )
                        }
                    </ul>
                </div>
            )
        }
    </HouseContext.Consumer>
);

export default Options;