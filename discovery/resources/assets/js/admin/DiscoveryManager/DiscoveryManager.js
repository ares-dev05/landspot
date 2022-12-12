import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {isEqual} from 'lodash';
import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';

import * as actions from './store/manager/actions';
import {LoadingSpinner, clickHandler} from '~/helpers';
import {ContentPanel} from '~/helpers/Panels';
import NiceDropdown from '~/helpers/NiceDropdown';
import ManagerTable from './components/ManagerTable';
import DialogList from './components/popups/DialogList';
import UserAction from './components/consts';
import store from './store';
import FileUploader from '../../file-uploader/FileUploader';

const queryString = require('query-string');

class DiscoveryManager extends Component {
    static propTypes = {
        manager: PropTypes.shape({
            houses: PropTypes.object,
            company: PropTypes.object,
            sortable: PropTypes.object,
            titleOrder: PropTypes.string,
            userRanges: PropTypes.array,
            currentRange: PropTypes.object,
        }).isRequired,

        resetManagerData: PropTypes.func.isRequired,
        getHouses: PropTypes.func.isRequired,
        updateHouseDiscovery: PropTypes.func.isRequired,
        removeHouse: PropTypes.func.isRequired,
        removeRange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.sortOrder = {
            sort: '',
            order: ''
        };

        this.state = {
            preloader: true,
            locationKey: null,
            userActionData: null,
            userAction: null,
            sortable: Object.assign({}, this.sortOrder),
            selectedRange: null
        };

    }

    componentDidMount() {
        const {location: {key: locationKey}} = this.props;

        this.getHouses();
        this.setState({locationKey});
    }

    getHouses = () => {
        const {location: {search}, getHouses} = this.props;
        if (search) {
            this.getLocationHouses(search);
        } else {
            getHouses();
        }
    };

    componentWillUnmount() {
        this.props.resetManagerData();
    }

    componentDidUpdate(prevProps, prevState) {
        const {locationKey} = this.state;
        const {
            manager: {errors},
            alert: {error},
            location: {search},
        } = this.props;

        if (prevState.locationKey !== locationKey) {
            this.getLocationHouses(search);
        }

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: actions.RESET_POPUP_MESSAGES});
            this.setState({preloader: false});
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {
            manager: {ajax_success, fetch},
            alert: {show},
            popupDialog: {ajax_success: popupMessage},
            location: {key: locationKey = ''}
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (ajax_success || popupMessage) {
            show(ajax_success || popupMessage, {type: 'success'});

            store.dispatch({type: actions.RESET_POPUP_MESSAGES});
        }

        if (fetch) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_FETCH_FLAG'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    showErrors = (propsErrors) => {
        const {
            alert: {error},
        } = this.props;

        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const column = propsErrors[error];
                errors[i] = {
                    message: `${column}`,
                };
            })
            : errors.push(propsErrors);

        if (errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
        }

        store.dispatch({type: actions.RESET_POPUP_MESSAGES});
    };

    getLocationHouses = (locationSearch) => {
        const parsed = queryString.parse(locationSearch);

        let sortable = Object.assign({}, this.sortOrder);
        for (let i in parsed) {
            let v = parsed[i];
            if (this.sortOrder.hasOwnProperty(i)) {
                sortable[i] = v;
            }
        }

        const selectedRange = parsed.range || null;

        this.setState({sortable, selectedRange, preloader: true});

        this.requestHousesHandler(parsed, false);
    };

    requestHousesHandler = (query, toHistory) => {
        const {history, location, getHouses} = this.props;

        if (toHistory) {
            const url = `${location.pathname}?${queryString.stringify(query)}`;
            history.push(url);
        } else {
            getHouses(query);
        }
    };

    setUserAction = (action, actionData, noActionToggle) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);
        const {userAction, userActionData} = this.state;

        const actionChanged = action !== userAction ||
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

    onPageSelect = (page) => {
        const query = this.props.location.search;
        const parsed = queryString.parse(query);
        parsed.page = page;

        this.requestHousesHandler(parsed, true);
    };

    sortHouses = (range) => {
        const {sortable} = this.state;
        const query = this.props.location.search;
        const parsed = queryString.parse(query);

        parsed.order = sortable.order === 'asc' ? 'desc' : 'asc';
        parsed.sort = 'title';
        (range) ? parsed.range = range : null;

        this.requestHousesHandler(parsed, true);
    };

    removeHandler = ({itemId: id, itemType}) => {
        const {location: {search}, removeHouse, removeRange} = this.props;

        const sortable = queryString.parse(search);

        switch (itemType) {
            case 'house':
                removeHouse(sortable, {id});
                break;
            case 'range':
                removeRange(sortable, {id});
                break;
        }

        this.setUserAction(null);
        this.setState({preloader: true});
    };

    userRangesList = () => {
        const {userRanges} = this.props.manager;

        return userRanges.map(range => ({value: range.id, text: range.name}));
    };

    updateDiscovery = ({house}) => {
        const {location: {search}, updateHouseDiscovery} = this.props;
        const sortable = queryString.parse(search);
        updateHouseDiscovery(sortable, house);
        this.setState({preloader: true});
    };

    XMLUploadError = (data) => {
        this.showErrors(data.errors);
        this.setState({preloader: false});
    };

    XMLUploadSuccess = ({ajax_success}) => {
        this.props.alert.success(ajax_success);
        this.getHouses();
    };

    beforeUploadXML = () => {
        this.setState({preloader: true});
    };

    render() {
        const {houses, userRanges, company} = this.props.manager;
        const {
            userActionData, userAction,
            preloader, sortable, selectedRange
        } = this.state;
        return (
            <ContentPanel className="discovery-manager">
                <header>Discovery Manager</header>

                <DialogList userAction={userAction}
                            userActionData={userActionData}
                            removeHandler={this.removeHandler}
                            getHouses={this.getHouses}
                            setUserAction={this.setUserAction}
                            company={company}
                />

                {houses === null ? (
                    <LoadingSpinner/>
                ) : (
                    <React.Fragment>
                        <div className="header table-header">
                            <div className="actions">
                                {
                                    company &&
                                    <a className='button default'
                                       onClick={(e) => clickHandler(e, this.setUserAction, [UserAction.SHOW_LOTMIX_PROFILE_DIALOG], {})}
                                    >
                                        Lotmix Profile
                                    </a>
                                }
                                <a className='button default'
                                   onClick={(e) => clickHandler(e, this.setUserAction, [UserAction.SHOW_INCLUSIONS_DIALOG, {
                                       userRanges
                                   }])}>
                                    Standard Inclusions
                                </a>

                                <a className='button default'
                                   onClick={(e) => clickHandler(e, this.setUserAction, [UserAction.SHOW_ADD_HOUSE_DIALOG, {
                                       userRanges,
                                       selectedRange
                                   }])}>
                                    <i className="landspot-icon plus"/>
                                    Add house
                                </a>

                                <FileUploader
                                    className="file-upload"
                                    baseUrl='/builder/upload-xml'
                                    acceptMime='application/xml'
                                    fileFieldName='file'
                                    chooseFileButton={
                                        <a className="button default">
                                            <i className="landspot-icon upload"/>
                                            Import from XML
                                        </a>
                                    }
                                    beforeUpload={this.beforeUploadXML}
                                    uploadError={this.XMLUploadError}
                                    uploadSuccess={this.XMLUploadSuccess}
                                />

                                <a className='button transparent'
                                   onClick={(e) => clickHandler(e, this.setUserAction, [UserAction.SHOW_REMOVE_RANGE_DIALOG, {
                                       userRanges
                                   }])}>
                                    <i className="landspot-icon trash"/>
                                    Delete range
                                </a>
                            </div>
                        </div>
                        <div className="header table-header">
                            <Pagination totalItemsCount={houses['total']}
                                        activePage={houses['current_page']}
                                        itemsCountPerPage={houses['per_page']}
                                        hideDisabled={true}
                                        onChange={page => this.onPageSelect(page)}
                            />
                            <div className="actions">
                                <NiceDropdown
                                    defaultItem='Select Range'
                                    defaultValue={null}
                                    items={this.userRangesList()}
                                    onChange={range => this.sortHouses(range)}
                                    value={selectedRange || null}
                                />
                            </div>
                        </div>

                        <ManagerTable
                            houses={houses}
                            sortable={sortable}
                            sortHouses={this.sortHouses}
                            updateDiscovery={this.updateDiscovery}
                            setUserAction={this.setUserAction}/>
                    </React.Fragment>
                )}

                {preloader && <LoadingSpinner className={'overlay'}/>}
            </ContentPanel>
        );
    }
}

export default withAlert(connect((state => ({
    manager: state.manager,
    popupDialog: state.popupDialog,
})), actions)(DiscoveryManager));