import React, {Fragment} from 'react';
import PropTypes from 'prop-types';

const FilterComponent = ({filters, onFilterChange, resetFilters, allSitings}) => (
    <Fragment>
        <div className="filter-bar">
            <div className="filter-form">
                <div className="first-row has-nav">
                    <p className="filters-header">Filter by</p>
                    <a
                        href="#"
                        className="clear-filters"
                        onClick={resetFilters}
                    >
                        Clear all
                    </a>
                </div>
            </div>
        </div>
        <div className="form-rows">
            <div className="form-row">
                <label className="left-item">First Name</label>
                <div className="left-item landspot-input">
                    <input
                        type="text"
                        placeholder="Name"
                        name="firstName"
                        value={filters.firstName}
                        onChange={e =>
                            onFilterChange({
                                [e.target.name]: e.target.value
                            })
                        }
                    />
                </div>
                <label className="left-item">Surname</label>
                <div className="left-item landspot-input">
                    <input
                        type="text"
                        placeholder="Name"
                        name="lastName"
                        value={filters.lastName}
                        onChange={e =>
                            onFilterChange({
                                [e.target.name]: e.target.value
                            })
                        }
                    />
                </div>
                {allSitings && (
                    <React.Fragment>
                        <label className="left-item">Consultant</label>
                        <div className="left-item landspot-input">
                            <input
                                type="text"
                                placeholder="Name"
                                name="consultant"
                                value={filters.consultant}
                                onChange={e =>
                                    onFilterChange({
                                        [e.target.name]: e.target.value
                                    })
                                }
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    </Fragment>
);

FilterComponent.propTypes = {
    filters: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    allSitings: PropTypes.bool
};

export default FilterComponent;
