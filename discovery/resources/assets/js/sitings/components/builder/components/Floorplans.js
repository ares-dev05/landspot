import {isEqual} from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {Link} from 'react-router-dom';
import React from 'react';
import {withAlert} from 'react-alert';
import Pagination from 'react-js-pagination';
import {connect} from 'react-redux';
import {clickHandler, dateFormat, LoadingSpinner, ToggleButton} from '~sitings~/helpers';
import * as actions from '../store/floorplans/actions';
import {FloorplanDetails} from './FloorplanDetails';
import {SearchBar} from './items';
import {DialogContext, DialogList, UserAction} from './items/DialogList';
import DocumentFileUploader from './items/DocumentFileUploader';
// import {SVGViewer} from '../../svg-viewer/components/SVGViewer';

const Columns = [
    'COMPANY', 'RANGE', 'STATE', 'FLOORPLAN NAME', 'DWG', 'LAST UPDATED', 'LIVE DATE', 'CALIBRATION', 'HISTORY', 'STATUS', 'ACTION'
];

const AdminColumns = new Set(['COMPANY', 'CALIBRATION']);

const SortOptions = [
    {sort_by: 'name', order: 'asc', title: 'Name Asc'},
    {sort_by: 'name', order: 'desc', title: 'Name Desc'},

    {sort_by: 'range.name', order: 'asc', title: 'Range Asc'},
    {sort_by: 'range.name', order: 'desc', title: 'Range Desc'},

    {sort_by: 'status', order: 'asc', title: 'Status Asc'},
    {sort_by: 'status', order: 'desc', title: 'Status Desc'},

    {sort_by: 'live_date', order: 'asc', title: 'Live Date Asc'},
    {sort_by: 'live_date', order: 'desc', title: 'Live Date Desc'},

    {sort_by: 'updated_at', order: 'asc', title: 'Update Date Asc'},
    {sort_by: 'updated_at', order: 'desc', title: 'Update Date Desc'},
];

const AdminSortOptions = [
    {sort_by: 'company.name', order: 'asc', title: 'Company Name Asc'},
    {sort_by: 'company.name', order: 'desc', title: 'Company Name Desc'},
];

export const CssStatuses = {
    'Awaiting Approval': 'awaiting-approval',
    'Active': 'active',
    'Attention': 'attention',
    'In Progress': 'in-progress',
};

export const HISTORY_EXISTS_UNREAD = 2;

export const FloorplansContext = React.createContext();

class Floorplans extends React.Component {
    static componentUrl = '/sitings/plans/floorplans';

    static propTypes = {
        getFloorplans: PropTypes.func.isRequired,
        deleteFloorplan: PropTypes.func.isRequired,
        updateFloorplan: PropTypes.func.isRequired,
        resetFloorplansStore: PropTypes.func.isRequired,
        resetDataUpdated: PropTypes.func.isRequired,
        builderFloorplans: PropTypes.shape({
            floorPlans: PropTypes.object,
            ranges: PropTypes.object,
            states: PropTypes.object,
        }).isRequired,

        userProfile: PropTypes.shape({
            company: PropTypes.object.isRequired,
            user: PropTypes.object.isRequired,
            permissions: PropTypes.object.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            locationKey: props.location.key || '',
            userAction: null,
            userActionData: null,
            filters: {}
        };
    }

    static getFiltersFromQuery = (props, prevFilters) => {
        const query = queryString.parse(props.location.search);
        const {page: qPage, order, sort_by: qSortBy} = query;
        const page = isFinite(qPage) ? parseInt(qPage) : 1;
        const newFilters = {
            page: page >= 1 ? page : 1,
            sort_by: ['name', 'range.name', 'status', 'live_date', 'company.name', 'updated_at'].indexOf(qSortBy) === -1 ? '' : qSortBy,
            order: (qSortBy !== '' && (order === 'asc' || order === 'desc')) ? order : ''
        };

        if (prevFilters) {
            Object.keys(prevFilters).forEach(key => {
                if (prevFilters[key] === newFilters[key]) {
                    delete newFilters[key];
                }
            });
        }
        return newFilters;
    };

    setUserAction = (action, actionData, noActionToggle) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);

        const actionChanged = action !== this.state.userAction ||
            (actionData != null && !isEqual(actionData, this.state.userActionData));

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

    onConfirmDelete = () => {
        const {userActionData: {itemType, itemId}, filters} = this.state;
        switch (itemType) {
            case 'floorplan': {
                this.setState({preloader: true});
                this.props.deleteFloorplan({id: itemId}, filters);
                break;
            }
            default:
        }
        this.setUserAction(null);
    };

    componentDidMount() {
        let filters = Floorplans.getFiltersFromQuery(this.props);
        const {match: {params: {floorplanId}}} = this.props;
        if (!filters['desc'] && !filters['updated_at']) {
            const floorplanUrl = floorplanId ? `/${floorplanId}` : '';
            this.props.history.replace(
                Floorplans.componentUrl + floorplanUrl + '?' + queryString.stringify({
                    order: 'desc',
                    sort_by: 'updated_at'
                })
            );
        }
        this.setState({filters});
    }

    componentWillUnmount() {
        this.props.resetFloorplansStore();
    }

    onNewFloorplanBtn = e => clickHandler(e, this.setUserAction(UserAction.BULK_UPLOADER, {}));

    onViewFloorplan = floorplanId => this.setUserAction(UserAction.EDIT_FLOORPLAN, {
        floorplanId,
        filters: this.state.filters,
        permissions: this.props.userProfile.permissions,
    });

    onLiveStatusChange = (id, is_live) => this.props.updateFloorplan(
        {id}, {is_live}, this.state.filters
    );

    onTrashFloorplan = (itemId, name) => this.setUserAction(
        UserAction.CONFIRM_REMOVE_ITEM, {itemType: 'floorplan', itemName: name, itemId}
    );

    onEditSVGFloorplan = floorplanId => this.setUserAction(UserAction.SVG_EDITOR, {floorplanId});

    onSVGUploaded = () => {
        this.props.alert.success('SVG file has been successfully uploaded.');
        this.getFloorplans(this.state.filters);
    };

    getFloorplans = filters => {
        this.setState({preloader: true});
        this.props.getFloorplans(filters);
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        const {match: {params: {floorplanId}}} = props;

        const {builderFloorplans:{errors}, alert:{error}} = props;

            if (errors && errors.length) {
                error(errors.map(
                    (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
                ));
                props.resetFloorplansMessages();
            }

        const locationKey = props.location.key || '';

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        const filters = Floorplans.getFiltersFromQuery(props, state.filters);

        if (Object.keys(filters).length > 0) {
            newState.filters = {
                ...state.filters,
                ...filters
            };
        }

        const {DATA_UPDATED, FLOORPLANS_UPDATED} = props.builderFloorplans;

        if (DATA_UPDATED || FLOORPLANS_UPDATED) {
            newState.preloader = false;

            props.resetDataUpdated();
            if (state.userAction === UserAction.BULK_UPLOADER) {
                props.alert.success('Floorplan added');
                newState.userAction = null;
                newState.userActionData = null;
            }
        }

        if (FLOORPLANS_UPDATED) {
            props.getFloorplans(state.filters);
        }

        if (floorplanId && state.userAction !== UserAction.VIEW_FLOORPLAN) {
            newState.userAction = UserAction.VIEW_FLOORPLAN;
            newState.userActionData = {floorplanId: parseInt(floorplanId)};
        }

        if (state.userAction === UserAction.VIEW_FLOORPLAN && !floorplanId) {
            newState.userAction = null;
            newState.userActionData = null;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    componentDidUpdate(prevProps, prevState) {
        const {filters, locationKey} = this.state;
        if (prevState.locationKey !== locationKey) {
            this.getFloorplans(filters);
        }



    }

    pushQueryToHistory = q => {
        this.props.history.push(
            Floorplans.componentUrl + '?' + queryString.stringify(q)
        );
    };

    onPageSelect = page => {
        this.pushQueryToHistory({...this.state.filters, ...{page}});
    };

    onSearchActionHandler = args => {
        if (args.option) {
            const {sort_by, order} = args.option;
            this.pushQueryToHistory({...this.state.filters, ...{sort_by, order}});
        }
    };

    onViewHistory = args => this.setUserAction(UserAction.VIEW_HISTORY, {...args, filters: this.state.filters});
    onViewFiles = args => this.setUserAction(UserAction.VIEW_FILES, args);
    gotoFloorplans = () => {
        this.pushQueryToHistory(this.state.filters);
    };

    render() {
        const {floorPlans, ranges, companies, states} = this.props.builderFloorplans;
        const {company, permissions: {isContractor, isAdmin, canCreateFloorplans}} = this.props.userProfile;
        const {filters, preloader, userAction, userActionData} = this.state;
        const dialogData = {};

        const floorPlansContextValues = {
            ...{
                ranges, companies, states, isAdmin, isContractor,
                onLiveStatusChange: this.onLiveStatusChange,
                onViewHistory: this.onViewHistory,
                onViewFiles: this.onViewFiles,
                onViewFloorplan: this.onViewFloorplan,
                onSVGUploaded: this.onSVGUploaded,
                onTrashFloorplan: this.onTrashFloorplan,
                onEditSVGFloorplan: this.onEditSVGFloorplan,
            }
        };

        return (
            <React.Fragment>
                <header>{isAdmin ? 'All' : company.name} Floorplans
                    {
                        canCreateFloorplans &&
                        <button type='button'
                                className='button default new-floorplan-btn'
                                onClick={this.onNewFloorplanBtn}>
                            Add Floorplan
                        </button>
                    }
                </header>
                <SearchBar autocompleteNames={[]}
                           actionHandler={this.onSearchActionHandler}
                           sortOptions={(isAdmin || isContractor) ? SortOptions.concat(AdminSortOptions) : SortOptions}
                           options={filters}
                           itemType='floorplan'
                />
                <div className='my-orders'>
                    <table className='portal-table'>
                        <thead>
                        <tr>
                            {
                                Columns
                                    .filter(item => (isAdmin || isContractor) || ((!isAdmin && !isContractor)
                                        && !AdminColumns.has(item)))
                                    .map(item => <th key={item}>{item}</th>)
                            }
                        </tr>
                        </thead>
                        <tbody>
                        {
                            preloader &&
                            <Preloader/>
                        }
                        {
                            floorPlans &&
                            <FloorplansContext.Provider value={floorPlansContextValues}>
                                <FloorplansList {...{floorPlans, isContractor, isAdmin}}/>
                            </FloorplansContext.Provider>
                        }
                        </tbody>
                    </table>
                    {
                        floorPlans !== null &&
                        <Pagination totalItemsCount={floorPlans['total']}
                                    activePage={floorPlans['current_page']}
                                    itemsCountPerPage={floorPlans['per_page']}
                                    hideDisabled={true}
                                    itemClass='page-item'
                                    linkClass='page-link'
                                    onChange={page => this.onPageSelect(page)}
                        />
                    }
                </div>

                <DialogContext.Provider data={dialogData}>
                    <DialogList setUserAction={this.setUserAction}
                                userActionData={userActionData}
                                onConfirmDelete={this.onConfirmDelete}
                                gotoFloorplans={this.gotoFloorplans}
                                {...{userAction}}
                    />
                </DialogContext.Provider>

            </React.Fragment>
        );
    }
}

const Preloader = () => (
    <tr>
        <td colSpan={Columns.length}><LoadingSpinner isStatic={true}/></td>
    </tr>
);

const Floorplan = ({id, name, status, range_id, company_id, updated_at, live_date, is_live, history, url}) => {
    return (
        <FloorplansContext.Consumer>
            {
                ({
                     ranges, companies, states, isAdmin, isContractor,
                     onViewHistory, onViewFiles, onViewFloorplan, onSVGUploaded, onLiveStatusChange,
                     onTrashFloorplan, onEditSVGFloorplan
                 }) =>
                    <tr>
                        {
                            (isAdmin || isContractor) && <td className='nowrap'>{companies[company_id]['name']}</td>
                        }
                        <td>{ranges[range_id].name}</td>
                        <td>{states[ranges[range_id].state_id].abbrev}</td>
                        <td>{name}</td>
                        <td className='actions'>
                            <button type='button'
                                    title='Download all attachments'
                                    className='transparent'
                                    onClick={e => clickHandler(e, onViewFiles, [{id, name}])}>
                                <i className="fal fa-file-signature"/>
                            </button>
                        </td>
                        <td>{dateFormat(updated_at)}</td>
                        <td className='nowrap'>
                            {live_date > 0 ? dateFormat(live_date) : 'ASAP'}
                            {
                                isAdmin &&
                                <ToggleButton
                                    buttonClass='set-live-status'
                                    textPosition='left'
                                    onClick={state => onLiveStatusChange(id, state)}
                                    toggledOnText='LIVE ON'
                                    state={!!is_live}
                                    toggledOffText='LIVE OFF'
                                />
                            }
                        </td>
                        {
                            (isAdmin || isContractor) &&
                            <td className='attachments'>
                                {
                                    url &&
                                    <a className='ellipsis svg-name'
                                       title={url}
                                       href={`/sitings/plans/download/svg/${id}`}>
                                        {url}
                                    </a>
                                }
                                {
                                    (isAdmin || isContractor) &&
                                    <div className='manage-svg'>
                                        <DocumentFileUploader
                                            buttonTitle={
                                                <i className="landconnect-icon cloud-upload"
                                                   title="Upload SVG"
                                                />
                                            }
                                            buttonClass='transparent'
                                            customFields={{floorplanId: id}}
                                            mimeType='image/svg+xml'
                                            uploadURL={'/sitings/plans/upload-document?file_type=SVG'}
                                            onFileUploaded={onSVGUploaded}
                                        />

                                        {
                                            url != null &&
                                            <button type='button'
                                                    title='Open SVG Viewer'
                                                    className='svg-viewer button transparent'
                                                    onClick={e => clickHandler(e, onEditSVGFloorplan, [id])}>
                                                <i className="landconnect-icon svg" title='View'/>
                                            </button>
                                        }
                                    </div>
                                }
                            </td>
                        }
                        <td className='actions'>
                            {
                                history > 0 &&
                                <button type='button'
                                        title='History'
                                        onClick={e => clickHandler(e, onViewHistory, [{id, name}])}
                                        className='transparent'>
                                    <i className={'fal fa-clipboard-list-check' + (
                                        (history === HISTORY_EXISTS_UNREAD && !isContractor && !isAdmin) ? ' history-animation' : ''
                                    )}/>
                                </button>
                            }
                        </td>

                        <td className='floorplan-status'>
                            <span>
                                <i className={CssStatuses[status]}/>
                                {status}
                            </span>
                        </td>
                        <td className='actions'>
                            {
                                ((isAdmin || status === 'Attention' || status === 'Active') && !isContractor) &&
                                <button type='button'
                                        title='Edit'
                                        className='transparent'
                                        onClick={e => clickHandler(e, onViewFloorplan, [id])}>
                                    <i className="fal fa-pencil-alt"/>
                                </button>
                            }

                            <Link to={{
                                pathname: FloorplanDetails.componentUrl + '/' + id,
                                state: {backParams: window.location.search}
                            }}>
                                <i className="landconnect-icon eye" title='View'/>
                            </Link>
                            {
                                isAdmin &&
                                <button type='button'
                                        title='Delete'
                                        className='transparent delete-btn'
                                        onClick={e => clickHandler(e, onTrashFloorplan, [id, name])}
                                ><i className="landconnect-icon trash"/></button>
                            }
                        </td>
                    </tr>
            }
        </FloorplansContext.Consumer>
    );
};

const FloorplansList = ({floorPlans, ...props}) => (
    floorPlans.total ?
        <React.Fragment>
            {
                floorPlans.data.map(
                    item => <Floorplan key={item.id}
                                       {...props}
                                       {...item}
                    />
                )
            }
        </React.Fragment>
        :
        <tr>
            <td colSpan={Columns.length}>No floorplans found</td>
        </tr>
);

export {Floorplans};

export default withAlert(connect(
    (state => ({
        builderFloorplans: state.builderFloorplans,
        userProfile: state.userProfile
    })), actions
)(Floorplans));

