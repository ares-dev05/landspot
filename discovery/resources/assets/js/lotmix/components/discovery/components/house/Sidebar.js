import React from 'react';
import Media from 'react-media';
import {HouseContext} from '~/discovery/House';
import {HouseOptions} from '~/discovery/components/catalogue/HousesList';
import {formatCurrency} from '~/helpers';

const Sidebar = () => {
    return (
        <HouseContext.Consumer>
            {
                ({selectedHouse}) => {
                    const {
                        range: {inclusions},
                        attributes: {description, depth, width, price}
                    } = selectedHouse;
                    return (
                        <React.Fragment>
                            <ul className='house-attributes'>
                                <HouseOptions {...selectedHouse}/>
                            </ul>
                            <Description {...{description, inclusions}}/>
                            <div className='dimensions'>
                                <div>
                                    <p className="dimension-title">LOT WIDTH</p>
                                    <p className="dimension">{width}m</p>
                                </div>
                                <div>
                                    <p className="dimension-title">LOT DEPTH</p>
                                    <p className="dimension">{depth}m</p>
                                </div>
                                <div>
                                    <p className="dimension-title">FROM</p>
                                    <p className="dimension">{formatCurrency(price)}</p>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                }
            }
        </HouseContext.Consumer>
    )
        ;
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