import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Filter from './components/Filter';
import UsersListHeader from './components/UsersListHeader';
import CompaniesList from './components/CompaniesList';
import {Company, CompanyInstance} from './components/Company';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import * as actions from './store/catalogue/actions';

import {Route, Switch} from 'react-router-dom';

const queryString = require('query-string');

class CompaniesCatalogue extends Component {
    static propTypes = {
        company: PropTypes.object,
        catalogue: PropTypes.shape({
            companies: PropTypes.array,
            user: PropTypes.object.isRequired,
        }).isRequired,

        filterCompaniesCatalogue: PropTypes.func.isRequired,
        newCompaniesCatalogue: PropTypes.func.isRequired,
        getUser: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.defaultPropsFilters = {
            // email: '',
            name: '',
            phone: '',
            globalEstateManager: 0,
            userManager: 0,
        };

        this.state = {
            selectedFilters: Object.assign({}, this.defaultPropsFilters),
            locationKey: null,
        };
    }

    componentDidMount() {
        const {
            catalogue: {user},
            getUser,
            location: {search},
        } = this.props;

        if (!user.id) {
            getUser();
        }

        if (search) {
            this.parseFilters(search);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {locationKey} = this.state;
        const {
            location: {search},
        } = this.props;

        if (prevState.locationKey !== locationKey) {
            this.parseFilters(search);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {
            location: {key: locationKey = ''}
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    parseFilters = (search) => {
        const parsed = queryString.parse(search);
        let selectedFilters = Object.assign({}, this.defaultPropsFilters);

        for (let i in parsed) {
            let v = parsed[i];
            if (this.defaultPropsFilters.hasOwnProperty(i)) {
                if (typeof this.defaultPropsFilters[i] === 'number') {
                    v = parseInt(v);
                    if (isNaN(v)) {
                        continue;
                    }
                }
                selectedFilters[i] = v;
            }
        }

        this.setState({selectedFilters});
    };

    getSelectedFilters = (filters = this.state.selectedFilters) => {
        let params = {};
        for (let key in this.defaultPropsFilters) {
            if (this.defaultPropsFilters.hasOwnProperty(key) && this.defaultPropsFilters[key] !== filters[key]) {
                params[key] = filters[key];
            }
        }
        return params;
    };

    onFilterChange = (data) => {
        const {
            location: {pathname},
            history: {push}
        } = this.props;
        const selectedFilters = Object.assign({}, this.state.selectedFilters, data);
        this.setState({selectedFilters: selectedFilters});

        const query = queryString.stringify(
            this.getSelectedFilters(selectedFilters)
        );

        push({
            pathname,
            search: `?${query}`
        });
    };

    backToResults = () => {
        let {
            location: {search},
            history: {push}
        } = this.props;

        push({
            pathname: CompaniesList.componentUrl,
            search
        });
    };

    resetFilter = () => {
        const {
            history: {push},
            location: {pathname}
        } = this.props;

        const selectedFilters = this.defaultPropsFilters;
        this.setState({selectedFilters, preloader: true});

        push(pathname);
    };

    currentFilters = () => {
        const selectedFilters = this.state.selectedFilters;
        const defaultPropsFilters = this.defaultPropsFilters;
        let siting = [];

        for (let key in selectedFilters) {
            if (!selectedFilters.hasOwnProperty(key)) {
                continue;
            }
            if (defaultPropsFilters[key] === selectedFilters[key]) {
                continue;
            }
            if ((selectedFilters[key] !== '')) {
                switch (key) {
                    case 'globalEstateManager':
                        siting.push({
                            'name': key,
                            'value': 'Global Estate Manager'
                        });

                        break;

                    case 'userManager':
                        siting.push({
                            'name': key,
                            'value': 'Edit Permissions'
                        });

                        break;

                    // case 'email':
                    //     siting.push({
                    //         'name': key,
                    //         'value': `${selectedFilters[key]}`
                    //     });
                    //
                    //     break;

                    case 'name':
                        siting.push({
                            'name': key,
                            'value': `${selectedFilters[key]}`
                        });

                        break;

                    default:
                        siting.push({
                            'name': key,
                            'value': selectedFilters[key]
                        });
                }
            }
        }
        return siting;
    };

    render() {
        const {
            company,
            catalogue: {
                user: {isGlobalAdmin = false}
            }
        } = this.props;
        const {selectedFilters} = this.state;
        return (
            <React.Fragment>
                <LeftPanel>
                    <Filter onFilterChange={this.onFilterChange}
                            selectedFilters={selectedFilters}
                            selectedCompany={company}
                            resetFilter={this.resetFilter}/>
                </LeftPanel>
                <RightPanel className='flex-column'>
                    <UsersListHeader
                        selectedCompany={company}
                        backToResults={this.backToResults}
                        currentFilters={this.currentFilters}
                        isGlobalAdmin={isGlobalAdmin}/>

                    <Switch>
                        <Route exact path={CompaniesList.componentUrl}
                               render={() => <CompaniesList getSelectedFilters={this.getSelectedFilters}/>}/>
                        <Route exact path={Company.componentUrl}
                               render={() => <CompanyInstance getSelectedFilters={this.getSelectedFilters}/>}/>
                    </Switch>
                </RightPanel>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        company: state.users.company,
        catalogue: state.catalogue,
    };
};

export default connect(mapStateToProps, actions)(CompaniesCatalogue);