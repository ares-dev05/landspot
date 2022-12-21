import React from 'react';
import {clickHandler} from '~/helpers';
import PropTypes from 'prop-types';

const EstateLotsHeader = ({currentFilters, isBuilder}) => {

    const filters = currentFilters();
    let activeFilters = [];
    filters.forEach(item => {
        switch (item.name) {
            case 'area':
                activeFilters.push(<span key={item.name} className="options-header">{item.value} m<sup>2</sup></span>);
                break;

            case 'width':
            case 'depth':
                activeFilters.push(<span key={item.name} className="options-header">{item.value}m</span>);
                break;

            case 'unsold_lots':
                if (item.value) {
                    activeFilters.push(<span key={item.name} className="options-header">Available Lots</span>);
                }
                break;

            case 'min':
            case 'max':
            case 'order':
            case 'order_type':
                break;

            case 'from_house':
                activeFilters.push(
                    <a key={item.name}
                       className="options-header selected-house"
                       href={`${isBuilder ? '/' : '/landspot/'}discovery/overview/${item.value.id}`}
                    >{item.value.title}</a>);
                break;

            default:
                activeFilters.push(<span key={item.name} className="options-header">{item.value}</span>);
        }
    });

    return (
        <div className="header">
            {
                activeFilters.length > 0 &&
                <span className="filter-enabled">Search result for</span>
            }
            {
                activeFilters
            }
        </div>
    );
};
EstateLotsHeader.propTypes = {
    currentFilters: PropTypes.func.isRequired,
    isBuilder: PropTypes.bool.isRequired,
};

export default EstateLotsHeader;