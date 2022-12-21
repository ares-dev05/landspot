import React, {Component} from 'react';
import {ContentPanel} from '~/helpers/Panels';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {isEqual} from 'lodash';
import Pagination from 'react-js-pagination';

import UserAction from './constants';
import {clickHandler} from '~/helpers';
import * as actions from '../store/myClients/actions';
import store from '../store';
import HeaderMyClientsTable from './HeaderMyClientsTable';
import StaticRow from './StaticRow';
import FilterComponent from './FilterComponent';
import DialogList from './popups/DialogList';
import {LoadingSpinner} from '~/helpers';

class MyClientsComponent extends Component {
    static componentUrl = '/landspot/my-clients';

    static propTypes = {
        getMyClients: PropTypes.func.isRequired,
        deleteMyClient: PropTypes.func.isRequired,
        deleteSiting: PropTypes.func.isRequired,
        clients: PropTypes.object,
        estates: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        deleted: PropTypes.bool.isRequired,
        company: PropTypes.object.isRequired,
        is_brief_admin: PropTypes.bool
    };

    static defaultPropsFilters = {
        firstName: '',
        lastName: '',
        consultant: '',
        page: 1
    };

    state = {
        userAction: null,
        userActionData: null,
        filters: {...MyClientsComponent.defaultPropsFilters}
    };

    componentDidUpdate(prevProps) {
        const {deleted} = this.props;

        if (deleted) {
            this.setUserAction(null);
            this.parseLocationFilters();
            store.dispatch({type: 'RESET_POPUP_DELETE_FLAG'});
        }

        if(this.props.clients && prevProps.clients !== this.props.clients){
            if(!this.props.clients.data.length && this.state.filters.page > 1){
                this.onFilterChange({page: 1});
            }
        }
    }

    componentDidMount() {
        this.parseLocationFilters(true);
    }

    static getDerivedStateFromProps(props) {
        const {
            newSiting
        } = props;

        if (newSiting) {
            let a = document.createElement('a');
            document.body.append(a);
            a.href = newSiting.absoluteUrl;
            a.click();
            a.remove();
        }
        return null;
    }

    setUserAction = (action, actionData, noActionToggle) => {
        console.log(
            'ACTION: ' + (action ? action.toString() : 'none'),
            actionData
        );
        const {userAction, userActionData} = this.state;

        const actionChanged =
            action !== userAction ||
            (actionData != null && !isEqual(actionData, userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        } else if (!noActionToggle) {
            this.setState({
                userAction: null,
                userActionData: null
            });
            action = null;
        }
    };

    parseLocationFilters = fullData => {
        const {
            location: {search},
            getMyClients
        } = this.props;
        const filters = MyClientsComponent.getFiltersFromLocation(search);
        this.setState({filters}, () => getMyClients({...filters, fullData}));
    };

    static getFiltersFromLocation = query => {
        const parsed = queryString.parse(query);
        const filters = {...MyClientsComponent.defaultPropsFilters};
        Object.keys(parsed).forEach(key => {
            let v = parsed[key];
            if (
                typeof MyClientsComponent.defaultPropsFilters[key] === 'number'
            ) {
                v = parseInt(v);
                if (isNaN(v)) {
                    return;
                }
            }
            filters[key] = v;
        });

        return filters;
    };

    static reduceFilters = (filters, defaults) => {
        const params = {};
        Object.keys(defaults).forEach(key => {
            if (defaults[key] !== filters[key]) {
                params[key] = filters[key];
            }
        });
        return params;
    };

    onFilterChange = data => {
        const filters = {...this.state.filters, ...data};
        const {getMyClients} = this.props;

        this.setState({filters}, () => getMyClients(filters));

        const query = MyClientsComponent.reduceFilters(
            filters,
            MyClientsComponent.defaultPropsFilters
        );
        this.getMyClientsFilterHandler(query, true);
    };

    resetFilters = () => {
        const {
            history: {push},
            location: {pathname, state},
            getMyClients
        } = this.props;

        this.setState(
            {
                filters: {...MyClientsComponent.defaultPropsFilters}
            },
            getMyClients
        );

        push({
            pathname,
            state
        });
    };

    getMyClientsFilterHandler = (query, toHistory) => {
        const {
            history: {push},
            location: {pathname, state}
        } = this.props;

        if (toHistory) {
            push({
                pathname,
                search: `?${queryString.stringify(query)}`,
                state
            });
        }
    };

    FilterResult = () => {
        const {filters} = this.state;
        let text = [];

        if (filters.firstName) {
            text.push(`First Name - ${filters.firstName}`);
        }

        if (filters.lastName) {
            text.push(`Last Name - ${filters.lastName}`);
        }

        text = text.length === 0 ? ['All'] : text;

        return <span className="filter-result_text">{text.join(', ')}</span>;
    };

    onDeleteClient = urlParam => {
        this.setUserAction(null);
        this.props.deleteMyClient(urlParam);
    };
    onDeleteSiting = urlParam => {
        this.setUserAction(null);
        this.props.deleteSiting(urlParam);
    };

    onDownload = siting => {
        if (this.props.draftFeature) {
            this.setUserAction(UserAction.SHOW_DRAFT_INVITE_CLIENT_DIALOG, siting);
        } else {
            window.open(siting.fileURL, '_blank');
        }
    };

    render() {
        const {filters, userAction, userActionData} = this.state;
        const {
            onFilterChange,
            resetFilters,
            FilterResult,
            setUserAction
        } = this;
        const {
            clients,
            loading,
            estates,
            company,
            is_brief_admin,
            chasLotmix = false,
            has_all_sitings
        } = this.props;
        const isBuilder = company.type === 'builder';
        return (
            <ContentPanel className="my-clients_content">
                <DialogList
                    userAction={userAction}
                    userActionData={userActionData}
                    setUserAction={setUserAction}
                    updateMyClientsTable={this.parseLocationFilters}
                    onDeleteClient={this.onDeleteClient}
                    onDelteSiting={this.onDeleteSiting}
                    isBuilder={isBuilder}
                    is_brief_admin={is_brief_admin}
                />
                <div className="header table-header">
                    <div className="my-clients_title">My Clients</div>
                    <div className="actions">
                        {isBuilder && (
                            <a
                                className="button default"
                                onClick={e =>
                                    clickHandler(e, setUserAction, [
                                        UserAction.SHOW_LEGACY_SITINGS_DIALOG
                                    ])
                                }
                            >
                                Old Sitings
                            </a>
                        )}
                        {!isBuilder && <a
                            className="button default"
                            onClick={e =>
                                clickHandler(e, setUserAction, [
                                    UserAction.SHOW_INVITE_CLIENT_DIALOG
                                ])
                            }
                        >
                            <i className="landspot-icon plus"/>
                            Add Buyer
                        </a>}
                    </div>
                </div>
                <FilterComponent
                    filters={filters}
                    resetFilters={resetFilters}
                    onFilterChange={onFilterChange}
                    allSitings={has_all_sitings}
                />
                <div>
                    {loading && <LoadingSpinner className={'overlay'}/>}
                    <div className="filter-result">
                        <span className="filter-result_title">
                            Showing results for:
                        </span>
                        <FilterResult/>
                    </div>
                    <table className="table users fixed my-clients-table">
                        <HeaderMyClientsTable
                            isBuilder={isBuilder}
                            chasLotmix={chasLotmix}
                            allSitings={has_all_sitings}
                        />
                        <tbody>
                        {clients && (
                            <ClientsList
                                clients={clients}
                                estates={estates}
                                allSitings={has_all_sitings}
                                setUserAction={setUserAction}
                                isBuilder={isBuilder}
                                chasLotmix={chasLotmix}
                                is_brief_admin={is_brief_admin}
                            />
                        )}
                        </tbody>
                    </table>
                    {clients && (
                        <Pagination totalItemsCount={clients['total']}
                                    activePage={clients['current_page']}
                                    itemsCountPerPage={clients['per_page']}
                                    hideDisabled={true}
                                    onChange={page => this.onFilterChange({page})}
                        />
                    )}
                </div>
            </ContentPanel>
        );
    }
}

const ClientsList = ({clients, isBuilder, ...props}) => (
    clients.total
        ? (
            clients.data.map((client, i) =>
                <StaticRow
                    key={
                        client.statusLabel
                            ? `s_${client.id + client.first_name + '_' + i}`
                            : `c_${client.id + client.first_name + '_' + i}`
                    }
                    clientInfo={client}
                    isDraftSiting={!!client.statusLabel}
                    isBuilder={isBuilder}
                    {...props}
                />
            )
        )
        : (
            <tr>
                <td className="my-clients-table_one-cell">
                    No invited{' '}
                    {isBuilder
                        ? 'clients'
                        : 'buyers'}
                </td>
            </tr>
        )
);

export default connect(
    state => ({...state.myClients}),
    actions
)(MyClientsComponent);