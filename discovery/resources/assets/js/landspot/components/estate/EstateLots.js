import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import {arrayMove} from 'react-sortable-hoc';
import queryString from 'query-string';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import UserAction from './consts';
import {clickHandler, LoadingSpinner} from '~/helpers';
import * as actions from '../../store/estate/actions';
import {EstateDataContext} from '../Estate-new';
import Stage from './Stage-new';
import store from '../../store';
import {debounce} from 'lodash';

export const EstateLotsDataContext = React.createContext();

class EstateLots extends Component {
    static propTypes = {
        estateData: PropTypes.shape({
            ESTATE_UPDATED: PropTypes.bool,
            estate: PropTypes.object.isRequired,
            columns: PropTypes.array.isRequired,
            stages: PropTypes.array.isRequired,
            isBuilder: PropTypes.bool.isRequired,
        }),
        selectedFilters: PropTypes.object,
        userActionData: PropTypes.object,
        userAction: PropTypes.symbol,

        setUserAction: PropTypes.func.isRequired,
        moveColumn: PropTypes.func.isRequired,
        updateLot: PropTypes.func.isRequired,
        addLot: PropTypes.func.isRequired,
        checkPermission: PropTypes.func.isRequired,
        removeStage: PropTypes.func.isRequired,
        removeLot: PropTypes.func.isRequired,
        removeColumn: PropTypes.func.isRequired,
        renameColumn: PropTypes.func.isRequired,
        addColumn: PropTypes.func.isRequired,
        getEstateLots: PropTypes.func.isRequired,
        updateStage: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            moveIndex: '',
            sortOverData: {},
            errors: [],
            screenSize: 0,
            preloader: false,

        };
    }

    static columnsByName = {};

    componentDidMount() {
        const {
            estateData: {columns}
        } = this.props;

        if (columns) {
            EstateLots.prepareColumnsByName(columns);
        }

        window.addEventListener('resize', this.onResize);
    }

    onResize = () => debounce(this.screenResize, 100)();

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    screenResize = () => {
        const screenSize = window.innerWidth;
        this.setState({screenSize});
    };

    static prepareColumnsByName(columns) {
        const columnsByName = {};
        columns.forEach((item, index) => {
            columnsByName[item['attr_name']] = {order: item['order'], index};
        });

        EstateLots.columnsByName = columnsByName;
    }

    static getDerivedStateFromProps(props, state) {
        const {
            estateData: {ESTATE_UPDATED, columns, errors},
            setUserAction,
            alert: {error}
        } = props;
        let newState = {...state};

        if (ESTATE_UPDATED) {
            newState.preloader = false;
            EstateLots.prepareColumnsByName(columns);
            setUserAction(null);
        }

        if (errors) {
            EstateLots.showErrors(errors, error);
            newState.preloader = false;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    getOrderType = (order) => {
        const {selectedFilters} = this.props;
        if (parseInt(selectedFilters.order) === order) {
            if (selectedFilters.order_type) {
                return selectedFilters.order_type === 'asc' ? 'desc' : 'asc';
            }
            return 'asc';
        }
        return 'asc';
    };

    getSortClass = (order) => {
        const {selectedFilters} = this.props;
        if (parseInt(selectedFilters.order) === order) {
            if (selectedFilters.order_type === 'asc') {
                return 'fal fa-sort-up';
            } else {
                return 'fal fa-sort-down';
            }
        }
        return 'fal fa-sort';
    };

    filterLots = (data) => {
        const {
            history: {push},
            location: {pathname, state},
            selectedFilters
        } = this.props;
        const query = {...selectedFilters, ...data};

        push({
            pathname,
            search: `?${queryString.stringify(query)}`,
            state
        });
    };

    getColumnIndex = (column) => {
        return EstateLots.columnsByName[column] ? EstateLots.columnsByName[column].index : -1;
    };

    onSortStart = ({index: moveIndex}) => {
        this.setState({moveIndex});
    };

    onSortOver = (sortOverData) => {
        this.setState({sortOverData});
    };

    onSortEnd = ({oldIndex, newIndex}) => {
        const {
            estateData: {columns, estate},
            moveColumn,
            selectedFilters
        } = this.props;

        if (oldIndex !== newIndex) {
            const estate_id = estate.id;
            const filters = {...selectedFilters, estate_id};

            const newColumns = arrayMove(columns, oldIndex, newIndex);

            const data = newColumns.map((key, index) => {
                return {order: index, id: key.id};
            });

            moveColumn({sortedColumns: data, filters});
            this.setState({preloader: true});
        }
        this.setState({moveIndex: '', sortOverData: {}});
    };

    onLotStatusChange = (stageId, lotId, status) => {
        const {
            estateData: {estate},
            selectedFilters,
            updateLot
        } = this.props;

        const estate_id = estate.id;
        const filters = {...selectedFilters, estate_id};
        const statusColumn = this.getColumnByOrder(EstateLots.columnsByName['status'].order);

        const attrId = statusColumn.id;
        const columnValues = {[attrId]: status};

        updateLot({estate_id, lotId, columnValues, filters}, {id: lotId});
    };

    updateLotmixVisibility = (lotId, visibility) => {
        const {
            estateData: {estate},
            selectedFilters,
            updateLotmixVisibility
        } = this.props;

        const estate_id = estate.id;
        const filters = {...selectedFilters, estate_id};

        updateLotmixVisibility({visibility, filters}, {id: lotId});
    };

    onLotInputChange = (data) => {
        const {
            userActionData,
            setUserAction
        } = this.props;
        const editableLotData = {...userActionData.editableLotData, ...data};

        setUserAction(UserAction.EDIT_LOT, {
            ...userActionData, editableLotData
        }, true);

        this.setState({errors: []});
    };

    saveLotHandler = (lotId, stageId) => {
        const {
            estateData: {estate, stages},
            selectedFilters,
            userActionData: {
                editableLotData: columnValues,
            },
            checkPermission,
            updateLot,
            addLot,
            setUserAction
        } = this.props;

        const estate_id = estate.id;
        const filters = {...selectedFilters, estate_id};
        const priceColumn = this.getColumnByOrder(EstateLots.columnsByName['price'].order);

        if (this.validateAction(columnValues, stageId, lotId)) {
            if (!checkPermission('price_editor')) {
                delete columnValues[priceColumn.id];
            }

            if (lotId) {
                if (Object.keys(columnValues).length !== 0) {
                    updateLot({columnValues, filters}, {id: lotId});
                }
            } else {
                const stage = stages.find(item => item.id === stageId);
                addLot({columnValues, filters}, stage);
            }

            setUserAction(null);
            this.setState({preloader: true});
        }
    };

    validateAction(values, stageId, lotId) {
        const {
            estateData: {columns, stages},
            checkPermission,
            alert: {error}
        } = this.props;

        let errors = [];
        const statusColumn = this.getColumnByOrder(EstateLots.columnsByName['status'].order);

        columns.forEach((column, index) => {
            const value = values[column.id];

            if (!value && column.attr_name === 'price' && !checkPermission('price_editor')) {
                return;
            }

            if (lotId) {
                const stage = stages.find(item => item.id === stageId);
                const lotIndex = stage.lotIds.findIndex(lot => lot === lotId);
                const lot = stage.lots[lotIndex];

                if (column.attr_name === 'price' && statusColumn && values[statusColumn.id] === 'Sold' &&
                    (value === '' || value === null)) {
                    return;
                }

                if ((!value && lot[index] === null) || value === '') {
                    errors[index] = {
                        message: `${column.display_name} required`,
                    };
                }
            } else {
                if (!value) {
                    errors[index] = {
                        message: `${column.display_name} required`,
                    };
                }
            }
        });

        if (errors.length !== 0) {
            let errorMsgs = errors.map((item, index) => <div key={index}>{item.message}</div>);

            error(errorMsgs);

            this.setState({errors});
            return false;
        } else {
            this.setState({errors});
            return true;
        }
    }

    getColumnByOrder = (order) => {
        const {
            estateData: {columns}
        } = this.props;
        return columns.find(column => column.order === order);
    };

    onLotEdit = (lotId, stageId) => {
        const {
            setUserAction,
            estateData: {columns}
        } = this.props;

        const lotValue = this.getLotData(stageId, lotId);
        let lotData = {};

        columns.forEach((column, index) => {
            lotData[column.id] = lotValue[index];
        });

        setUserAction(
            UserAction.EDIT_LOT,
            {
                editableLotItem: {
                    lotId, stageId
                },
                editableLotData: lotData
            },
            true
        );
    };

    getLotData(stageId, lotId) {
        const {
            estateData: {stages},
        } = this.props;

        const stage = stages.find(item => item.id === stageId);
        const lotIndex = stage.lotIds.findIndex(lot => lot === lotId);

        return stage.lots[lotIndex];
    }

    toggleDisplayNewLot = (stageId) => {
        const {
            userAction,
            setUserAction,
            userActionData
        } = this.props;

        let beginAddNewLot = userAction !== UserAction.EDIT_LOT;

        if (!beginAddNewLot && (userActionData.editableLotItem.stageId !== stageId || userActionData.editableLotItem.lotId !== null)) {
            beginAddNewLot = true;
        }

        if (beginAddNewLot) {
            let editableLotData = {};
            const statusColumn = this.getColumnByOrder(EstateLots.columnsByName['status'].order);
            editableLotData[statusColumn.id] = 'Available';
            setUserAction(UserAction.EDIT_LOT, {
                editableLotItem: {stageId: stageId, lotId: null},
                editableLotData
            }, true);
        } else {
            setUserAction(null, null, true);
        }
    };

    onRemove = (itemType, itemId, itemValue) => {
        const {
            estateData: {stages},
            setUserAction,
        } = this.props;

        let itemName = '';
        switch (itemType) {
            case 'lot':
                itemName = 'Lot №' + itemValue;
                break;
            case 'column': {
                let column = this.getColumnByOrder(itemId);
                itemId = column.id;
                itemName = 'Column ' + column.display_name;
            }
                break;

            case 'stage': {
                let stage = stages.find(stage => stage.id === itemId);
                itemId = stage.id;
                itemName = 'Stage ' + stage.name;
            }
                break;
        }

        const userActionData = {
            itemType,
            itemId,
            itemName,
            removeHandler: this.removeHandler
        };
        setUserAction(UserAction.CONFIRM_REMOVE_ITEM, userActionData);
    };

    removeHandler = (data) => {
        const {
            setUserAction,
            removeStage,
            removeLot,
            removeColumn,
            selectedFilters: filters
        } = this.props;

        const id = data.itemId;

        switch (data.itemType) {
            case 'column':
                removeColumn({filters}, {id});
                break;

            case 'lot':
                removeLot({filters}, {id});
                break;

            case 'stage':
                removeStage({filters}, {id});
                break;
        }

        setUserAction(null);
        this.setState({preloader: true});
    };

    saveColumn = () => {
        const {
            estateData: {estate},
            selectedFilters,
            userActionData,
            addColumn,
            renameColumn,
            setUserAction
        } = this.props;

        const estate_id = estate.id;
        const filters = {...selectedFilters, estate_id};

        const display_name = userActionData.newColumnName;
        const columnId = userActionData.columnId;

        if (columnId) {
            renameColumn({estate_id, display_name, filters}, {columnId});
        } else {
            addColumn({estate_id, display_name, filters});
        }
        setUserAction(null);
        this.setState({preloader: true});
    };

    priceListUploaded = (response) => {
        const {
            alert: {show},
            getEstateLots
        } = this.props;

        let alertMsg = '';
        let alertType = 'error';

        if (response.error) {
            alertMsg = response.error;
        } else if (response.success) {
            alertMsg = response.success;
            alertType = 'success';

            getEstateLots();
        } else {
            alertMsg = response.message;
        }

        show(
            alertMsg,
            {
                type: alertType,
            }
        );
        this.setState({preloader: false});
    };

    priceListUploadBefore = () => {
        this.setState({preloader: true});
    };

    priceListUploadError = (data) => {
        const {
            alert: {error},
        } = this.props;

        EstateLots.showErrors(data.errors || data.message, error);
        this.setState({preloader: false});
    };

    static showErrors = (propsErrors, error) => {
        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const message = propsErrors[error];
                errors[i] = {
                    message,
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

    updateStageStatus = (published, stage) => {
        const {
            updateStage,
            selectedFilters: filters
        } = this.props;

        updateStage({published, filters}, stage);
        this.setState({preloader: true});
    };

    bulkUpdateLot = (value) => {
        const {
            estateData: {estate},
            selectedFilters,
            bulkUpdateLot,
            resetUserAction,
            userActionData
        } = this.props;
        const estate_id = estate.id;
        const filters = {...selectedFilters, estate_id};
        bulkUpdateLot({...userActionData, ...value, filters, estate_id});
        this.setState({preloader: true});
        resetUserAction();
    }

    render() {
        const {
            estateData: {
                stages,
                isBuilder
            },
            setUserAction,
            selectedFilters: filters,
            checkPermission
        } = this.props;
        const {preloader} = this.state;
        const canEdit = !isBuilder && !checkPermission('read_only');
        let soldStagesHeaderAdded = false;

        const contextData = {
            getOrderType: this.getOrderType,
            getSortClass: this.getSortClass,
            getColumnIndex: this.getColumnIndex,
            filterLots: this.filterLots,
            onSortStart: this.onSortStart,
            onSortEnd: this.onSortEnd,
            onSortOver: this.onSortOver,
            onLotStatusChange: this.onLotStatusChange,
            onLotEdit: this.onLotEdit,
            state: this.state,
            onRemove: this.onRemove,
            toggleDisplayNewLot: this.toggleDisplayNewLot,
            saveColumn: this.saveColumn,
            onLotInputChange: this.onLotInputChange,
            saveLotHandler: this.saveLotHandler,
            priceListUploaded: this.priceListUploaded,
            priceListUploadBefore: this.priceListUploadBefore,
            priceListUploadError: this.priceListUploadError,
            updateStageStatus: this.updateStageStatus,
            updateLotmixVisibility: this.updateLotmixVisibility,
            bulkUpdateLot: this.bulkUpdateLot
        };
        return (
            <EstateLotsDataContext.Provider value={contextData}>
                <div className='stages'>
                    {preloader && <LoadingSpinner className={'overlay'}/>}

                    {canEdit &&
                    <div className="add-stage">
                        <a className='button default'
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.ADD_STAGE, {filters}])}>
                            <i className="landspot-icon plus"/>
                            Add a stage
                        </a>
                    </div>
                    }

                    {
                        stages.map(
                            stage => {
                                let soldStageHeader = null;
                                if (stage.sold && !soldStagesHeaderAdded) {
                                    soldStagesHeaderAdded = true;
                                    soldStageHeader = <div key={'soldHeader'}
                                                           className="sold-header">
                                        Sold out stages</div>;
                                }
                                return [
                                    soldStageHeader,
                                    <Stage key={stage.id} stage={stage}/>
                                ];
                            }
                        )
                    }

                </div>
            </EstateLotsDataContext.Provider>
        );
    }
}

const EstateLotsConsumer = (props) => (
    <EstateDataContext.Consumer>
        {
            ({
                 userAction,
                 setUserAction,
                 selectedFilters,
                 userActionData,
                 checkPermission,
                 getEstateLots,
                 resetUserAction
             }) =>
                <EstateLots {...props} {...{
                    userAction,
                    setUserAction,
                    selectedFilters,
                    userActionData,
                    checkPermission,
                    getEstateLots,
                    resetUserAction
                }}/>
        }
    </EstateDataContext.Consumer>
);

export default withAlert(withRouter(connect((
    state => ({estateData: state.estate})
), actions)(EstateLotsConsumer)));