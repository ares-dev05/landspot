import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import React from 'react';
import Pagination from 'react-js-pagination';
import {formatCurrency} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';

export const HouseOptions = ({beds, cars, bathrooms, attributes: {price}}) => {
    const item = (icon, text) => <li><i className={`landspot-icon ${icon}`} aria-hidden="true"/><span>{text}</span>
    </li>;
    return <React.Fragment>
        {
            beds > 0 && item('bedroom', beds)
        }
        {
            cars > 0 && item('car-park', cars)
        }
        {
            bathrooms > 0 && item('bathroom', bathrooms)
        }
        {
            price && <li className="price">From {formatCurrency(price)}</li>
        }
    </React.Fragment>;
};

const HousesList = ({
                        houses,
                        onHouseSelect,
                        onPageSelect,
                        appliedFilters,
                        showPrice = false,
                        hideNaPrice = false
                    }) => {

    const showPagination = houses['total'] > houses['per_page'];

    const filterNaPrice = price => hideNaPrice ? !!price : true;

    return (
        <React.Fragment>
            <div className="header">
                <div className='results'>{houses.total} {pluralize('results', houses.total)}</div>
                {appliedFilters}
            </div>
            {houses.data.length > 0
                ? <Cards>
                    {houses.data.map(house =>
                        <CardImageItem
                            key={house.id}
                            bgSize='cover'
                            bgImage={`url('${house.image}')`}
                            onClick={() => onHouseSelect(house)}
                            title={house.title}
                            attrList={<HouseOptions {...house}/>}
                            customContent={
                                <React.Fragment>
                                    {
                                        (showPrice && filterNaPrice(house.attributes.price)) ?
                                            <div
                                                className='lot-price-mark'>From {formatCurrency(house.attributes.price)}</div>
                                            : null
                                    }
                                </React.Fragment>
                            }
                        />)
                    }
                </Cards>
                : <p>There are no results that match your search</p>
            }

            {!showPagination && (
                <Pagination totalItemsCount={houses['total']}
                            activePage={houses['current_page']}
                            itemsCountPerPage={houses['per_page']}
                            hideDisabled={true}
                            onChange={onPageSelect}
                            innerClass='pagination'
                />
            )}
        </React.Fragment>
    );
};

HousesList.propTypes = {
    houses: PropTypes.object.isRequired,
    onHouseSelect: PropTypes.func.isRequired,
    onPageSelect: PropTypes.func.isRequired,
};

export default HousesList;