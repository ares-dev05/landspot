import React from 'react';
import {connect} from 'react-redux';
import {PathNavLink} from '~/helpers';

import {CompaniesDataContext} from '../../CompaniesCatalogue';

class OptionHeader extends React.Component {
    render() {
        return (
            <CompaniesDataContext.Consumer>
                {
                    ({selectedCompany, selectedFilters, defaultPropsFilters, priceFilters}) => {
                        const activeFilters = getActiveFilters(selectedFilters, defaultPropsFilters, priceFilters);
                        return (
                            <React.Fragment>
                                {
                                    (activeFilters.length || selectedCompany) &&
                                    <span className="filter-enabled">Search result for</span>
                                }
                                {
                                    activeFilters
                                }

                                {
                                    selectedCompany &&
                                    <React.Fragment>
                                        <span className="options-header">{selectedCompany.name}</span>
                                        <PathNavLink className="back-nav"
                                                     to={this.props.basePath}>
                                            <i className="fal fa-arrow-left"/>
                                            <span>Back to Builders List</span>
                                        </PathNavLink>
                                    </React.Fragment>
                                }
                            </React.Fragment>
                        );
                    }
                }
            </CompaniesDataContext.Consumer>

        );
    }
}

function getActiveFilters(selectedFilters, defaultPropsFilters, priceFilters) {
    let currentFilters = [];
    let priceAdded, areaAdded;
    let activeFilters = [];

    Object.keys(selectedFilters).forEach(key => {
        if (defaultPropsFilters[key] === selectedFilters[key]) {
            return;
        }
        switch (key) {
            case 'min':
            case 'max':
                if (!priceAdded && priceFilters &&
                    (
                        isFinite(selectedFilters.max) &&
                        isFinite(selectedFilters.min) && (
                            selectedFilters.max !== priceFilters.max ||
                            selectedFilters.min !== priceFilters.min
                        )
                    )) {

                    currentFilters.push({
                        name: 'between',
                        value: `between $${selectedFilters.min} and $${selectedFilters.max}`
                    });

                    priceAdded = true;
                }
                break;

            case 'width':
            case 'depth':
                if (!areaAdded &&
                    (
                        selectedFilters.width !== defaultPropsFilters.width ||
                        selectedFilters.depth !== defaultPropsFilters.depth
                    )) {

                    if (selectedFilters.width > 0 && selectedFilters.depth > 0) {
                        currentFilters.push({
                            name: 'area',
                            value: selectedFilters.width * selectedFilters.depth
                        });
                    }

                    areaAdded = true;
                }
                break;

            case 'company_id':
                break;

            default:
                currentFilters.push(
                    {
                        'name': key,
                        'value': selectedFilters[key]
                    }
                );
        }
    });

    currentFilters.forEach((item, index) => {
        let value = item.value.toString().replace('<', '&lt;');
        value = value.replace('>', '&gt;');
        let dimension = '';
        switch (item.name) {
            case 'area':
                dimension = 'm<sup>2</sup>';
                break;

            case 'beds':
                dimension = item.value > 1 ? 'beds' : 'bed';
                break;

            case 'bathrooms':
                dimension = item.value > 1 ? 'bathrooms' : 'bathroom';
                break;

            case 'single':
                value = 'Single storey';
                break;

            case 'double':
                value = 'Double storey';
                break;

            case 'width':
            case 'depth':
                return;
        }
        if (dimension) {
            dimension = '&nbsp;' + dimension;
        }
        activeFilters.push(<span key={index} className="options-header"
                                 dangerouslySetInnerHTML={{__html: value + dimension}}/>);
    });

    return activeFilters;
}

export default connect((state => ({
    basePath: state.catalogue.basePath
})))(OptionHeader);