import {isEqual} from 'lodash';
import React, {Fragment} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {LoadingSpinner} from '~/helpers';
import {ContentPanel} from '~/helpers/Panels';
import * as actions from '../store/estate/actions';
import EstateProperties from './estate/EstateProperties';
import queryString from 'query-string';
import DialogList from './popups/DialogList';
import UserAction from './estate/consts';
import {LandspotEstates} from '../LandspotEstates';
import store from '../store';
import LotsFilter from './LotsFilter';
import EstateLots from './estate/EstateLots';
import LotmixProfile from './LotmixProfile';
import axios from 'axios';

export const EstateDataContext = React.createContext();

class Estate extends React.Component {
    static componentUrl = '/landspot/estate/:estateId';

    static propTypes = {
        addColumn: PropTypes.func.isRequired,
        addLot: PropTypes.func.isRequired,
        getEstateLots: PropTypes.func.isRequired,
        moveColumn: PropTypes.func.isRequired,
        removeColumn: PropTypes.func.isRequired,
        removeLot: PropTypes.func.isRequired,
        removeStage: PropTypes.func.isRequired,
        resetEstateData: PropTypes.func.isRequired,
        updateLot: PropTypes.func.isRequired,
        updateStage: PropTypes.func.isRequired,
        updateEstate: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            userAction: null,
            locationKey: null,
            preloader: false,
            userActionData: null,
            showLotmixTab: false
        };
    }

    componentDidMount() {
        this.getEstateLots(true);

        try {
            if (window.pusherSocket) {
                const {
                    match: {params}
                } = this.props;

                if (params.estateId) {
                    this.pusherChannel = window.pusherSocket.subscribe(
                        `estate.${params.estateId}`
                    );
                    this.pusherChannel.bind('App\\Events\\EstateUpdated', e => {
                        const {
                            estate: {isBuilder}
                        } = this.props;
                        if (e.lotVisibility === 0 && isBuilder) {
                            return;
                        } else {
                            this.getEstateLots(false);
                        }
                    });
                } else {
                    console.log('Invalid estate');
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {locationKey} = this.state;

        if (prevState.locationKey !== locationKey) {
            this.getEstateLots();
        }

        const {
            pusherSocket: {connection}
        } = window;

        const {common} = axios.defaults.headers;
        if (connection.socket_id && !common['X-Socket-Id']) {
            common['X-Socket-Id'] = connection.socket_id;
        }
    }

    componentWillUnmount() {
        this.props.resetEstateData();

        if (this.pusherChannel) {
            try {
                this.pusherChannel.unbind();
            } catch (e) {
                console.log(e);
            }
        }
    }

    getEstateLots = (withFilters = false) => {
        const {
            getEstateLots,
            match: {params}
        } = this.props;

        const selectedFilters = this.getSelectedFilters();

        if (withFilters) {
            selectedFilters.filters = 1;
        }

        getEstateLots({id: params.estateId}, selectedFilters);
        this.setState({preloader: true});
    };

    getSelectedFilters = () => {
        const {
            location: {search}
        } = this.props;

        return LotsFilter.getSelectedFilters(search);
    };

    static getDerivedStateFromProps(props, state) {
        const {
            estate: {ajax_success, ESTATE_UPDATED},
            alert: {success},
            location: {key: locationKey = state.locationKey} //plug solution, if sm wrong with updating lots - locationKey = ''
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (ajax_success) {
            success(ajax_success);
            store.dispatch({type: actions.RESET_POPUP_MESSAGES});
        }

        if (ESTATE_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_ESTATE_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
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

        this.onUserAction(action, actionData);
    };

    onUserAction(action) {
        const {
            estate: {columns},
            alert: {error}
        } = this.props;

        if (
            action === UserAction.DELETE_COLUMN &&
            !columns.some(item => item.column_type === 'dynamic')
        ) {
            error('Please add at least one custom column to delete');
        }
    }

    resetUserAction = () => {
        this.setUserAction(null);
    };

    backToEstates = () => {
        const {
            location: {state},
            history: {push}
        } = this.props;

        if (state) {
            const {estatesFilters} = state;
            if (estatesFilters) {
                push(`${LandspotEstates.componentUrl}${estatesFilters}`);
            }
        } else {
            push(LandspotEstates.componentUrl);
        }
    };

    checkPermission = name => {
        const {permissions} = this.props.estate;

        if (!permissions || permissions.length === 0) return false;

        switch (name) {
            case 'list_manager':
            case 'read_only':
            case 'price_editor':
            case 'pdf_manager':
            case 'lotmix':
                return permissions.indexOf(name) !== -1;

            default:
                return false;
        }
    };

    checkFeature = name => {
        const {features} = this.props.estate;

        if (!features || features.length === 0) return false;

        switch (name) {
            case 'lot-drawer':
            case 'lotmix':
                return features.indexOf(name) !== -1;

            default:
                return false;
        }
    };

    updateEstate = data => {
        const {updateEstate, estate} = this.props;
        updateEstate(data, {id: estate.estate.id});
        this.setState({preloader: true});
    };
    switchLotmixTab = showLotmix => {
        this.setState({showLotmixTab: showLotmix});
    };
    render() {
        const {columns, estate} = this.props.estate;
        const {
            userActionData,
            userAction,
            preloader,
            showLotmixTab
        } = this.state;

        if (!columns) return <LoadingSpinner className={'overlay'} />;

        const selectedFilters = this.getSelectedFilters();
        const queryFilters = queryString.stringify(selectedFilters);
        const contextData = {
            estateId: estate.id,
            userAction,
            userActionData,
            selectedFilters,
            updateEstate: this.updateEstate,
            setUserAction: this.setUserAction,
            resetUserAction: this.resetUserAction,
            backToEstates: this.backToEstates,
            checkPermission: this.checkPermission,
            checkFeature: this.checkFeature,
            getEstateLots: this.getEstateLots,
            switchLotmixTab: this.switchLotmixTab
        };
        return (
            <ContentPanel className={'wrap-items landspot-estate'}>
                {preloader && <LoadingSpinner className={'overlay'} />}
                <EstateDataContext.Provider value={contextData}>
                    <DialogList />
                    <EstateProperties {...{queryFilters}} />
                    {showLotmixTab ? (
                        <LotmixProfile />
                    ) : (
                        <Fragment>
                            <LotsFilter />
                            <EstateLots />
                        </Fragment>
                    )}
                </EstateDataContext.Provider>
            </ContentPanel>
        );
    }
}

export {Estate};

export default withAlert(
    connect(
        state => ({estate: state.estate}),
        actions
    )(Estate)
);
