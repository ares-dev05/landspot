import React from 'react';
import {HouseContext} from '../../House';
import {HouseOptions} from '../catalogue/HousesList';

const Sidebar = () => {
    return (
        <HouseContext.Consumer>
            {
                ({selectedHouse}) => {
                    const {range: {inclusions},
                        attributes: {description, depth, width}
                    } = selectedHouse;
                    return (
                        <React.Fragment>
                            <ul className='house-attributes'>
                                <HouseOptions {...selectedHouse}/>
                            </ul>

                            <Description {...{description, inclusions}}/>

                            <div className='dimensions'>
                                LOT WIDTH<span>{width}m</span>LOT DEPTH<span>{depth}m</span>
                            </div>
                        </React.Fragment>
                    );
                }
            }
        </HouseContext.Consumer>
    );
};

const Description = ({inclusions, description}) => {
    let inclusionsByLine = null;
    if (!description && inclusions) {
        inclusionsByLine = inclusions.split(/[\r\n]+/g).filter(item => {
            return item.length && !/^\s+$/.test(item);
        });
    }
    return (
        <React.Fragment>
            {
                description &&
                <div className="house-description">{description}</div>
            }
            {
                inclusionsByLine &&
                <ul className='house-description'>
                    {
                        inclusionsByLine.map((item, i) => <li key={i}>{item}</li>)
                    }
                </ul>
            }
        </React.Fragment>
    );
};

export default Sidebar;