import React from 'react';
import Media from 'react-media';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import FilterNav from './FilterNav';

const EstateLotsHeader = ({currentFilters, items, displayMap, setMapState}) => {

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
                       href={`/discovery/overview/${item.value.id}`}
                    >{item.value.title}</a>);
                break;

            default:
                activeFilters.push(<span key={item.name} className="options-header">{item.value}</span>);
        }
    });

    return (
        <div className="header">
            <div className='results'>{items.length} {pluralize('results', items.length)}</div>
            {
                activeFilters.length > 0 &&
                <Media queries={{
                    medium: '(max-width: 760px)',
                    large: '(min-width: 761px)'
                }}>
                    {matches => (
                        <React.Fragment>
                            {(matches.medium && activeFilters.length)
                                ? <span className="filter-enabled">Viewing:</span>
                                : null
                            }
                            {matches.large && activeFilters.length &&
                            <span className="filter-enabled">Search result for</span>}
                        </React.Fragment>
                    )}
                </Media>
            }
            {
                activeFilters
            }
            <FilterNav
                displayMap={displayMap}
                setMapState={setMapState}
            />
        </div>
    );
};
EstateLotsHeader.propTypes = {
    currentFilters: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
};

export default EstateLotsHeader;