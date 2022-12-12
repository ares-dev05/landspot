import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import EditableLotRow from './lot-row/EditableLotRow';
import StaticLotRow from './lot-row/StaticLotRow';
import * as actions from '../../store/estate/actions';
import HeaderCellsList from './HeaderCellsList';
import {EstateDataContext} from '../Estate-new';
import {EstateLotsDataContext} from './EstateLots';

import UserAction from './consts';
import SortableCellsList from './SortableCellsList';


class StageLotsTable extends Component {
    static propTypes = {
        estateData: PropTypes.shape({
            isBuilder: PropTypes.bool.isRequired,
            has_discovery: PropTypes.bool.isRequired,
            columns: PropTypes.array.isRequired,
        }),
        userAction: PropTypes.symbol,
        stage: PropTypes.object,
        userActionData: PropTypes.object,
        setUserAction: PropTypes.func.isRequired,
        checkPermission: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {
            estateData: {
                isBuilder,
                has_discovery: isDiscoveryBuilder,
                columns,
                filters
            },
            userAction, stage, userActionData, setUserAction,
            checkPermission, checkFeature
        } = this.props;

        const displayNewColumn = userAction === UserAction.ADD_COLUMN;

        let {editableLotItem, editableLotData} = userActionData ? userActionData : {};

        const staticColumnsCount = isBuilder
            ? checkPermission('pdf_manager')
                ? 2
                : 1
            : !checkPermission('read_only')
                ? checkFeature('lotmix')
                    ? 5
                    : 4
                : 2; //Packages, Discovery, Visibility, Edit
        const columnsLength = displayNewColumn ? columns.length + 1 : columns.length;

        return (
            <div className="responsive-table overflow-unset">
                <EstateLotsDataContext.Consumer>
                    {
                        ({onSortEnd, onSortStart, onSortOver, state: {preloader, moveIndex}, onRemove}) => (
                            <table className="table lots">
                                <thead>
                                {userAction === UserAction.MOVE_COLUMN
                                    ? <SortableCellsList
                                        checkPermission={checkPermission}
                                        columns={columns}
                                        onSortEnd={onSortEnd}
                                        onSortStart={onSortStart}
                                        onSortOver={onSortOver}
                                        helperClass="moving"
                                        hideSortableGhost={false}
                                        axis='x'
                                    />
                                    : <HeaderCellsList
                                        isBuilder={isBuilder}
                                        onRemove={data => onRemove('column', data)}
                                        stage={stage}
                                        columns={columns}
                                        priceMax={filters.price_max}
                                    />
                                }
                                </thead>

                                <tbody
                                    className={classnames(((moveIndex || moveIndex === 0)) ? 'movable' : '', preloader ? 'saving-data' : '')}>
                                {
                                    editableLotItem &&
                                    !editableLotItem.lotId &&
                                    editableLotItem.stageId === stage.id &&
                                    <EditableLotRow
                                        columns={columns}
                                        editableLotItem={editableLotItem}
                                        editableLotData={editableLotData}
                                        staticColumnsCount={staticColumnsCount}
                                        stageId={stage.id}
                                        checkPermission={checkPermission}
                                    />
                                }
                                {
                                    stage.lots.map((lot, lotIndex) => {
                                        const lotId = stage['lotIds'][lotIndex];
                                        return (
                                            editableLotItem &&
                                            editableLotItem.lotId === lotId &&
                                            editableLotItem.stageId === stage.id
                                        )
                                            ? <EditableLotRow key={lotId}
                                                              editableLotItem={editableLotItem}
                                                              editableLotData={editableLotData}
                                                              columns={columns}
                                                              lotId={lotId}
                                                              stageId={stage.id}
                                                              staticColumnsCount={staticColumnsCount}
                                                              checkPermission={checkPermission}
                                            />
                                            : <StaticLotRow key={lotId}
                                                            changeLotVisibility={() => setUserAction(UserAction.EDIT_LOT_VISIBILITY, {lotId})}
                                                            showLotPackagesDialog={() => setUserAction(UserAction.EDIT_LOT_PACKAGES, {
                                                                lotId,
                                                                isPdfManager: checkPermission('pdf_manager')
                                                            })}
                                                            showLotDrawerDialog={(data) => setUserAction(UserAction.VIEW_LOT_DRAWER, {lotId, ...data})}
                                                            drawerData={stage.drawerData[lotIndex]}
                                                            lotVisibility={stage.lotsVisibility[lotIndex]}
                                                            lotmixLotVisibility={stage.lotmixLotsVisibility[lotIndex]}
                                                            packagesCount={stage.lotPackages[lotIndex]}
                                                            toggleDeleteLot={(lotValue) => onRemove('lot', lotId, lotValue)}
                                                            columns={columns}
                                                            isBuilder={isBuilder}
                                                            displayNewColumn={displayNewColumn}
                                                            lot={lot}
                                                            stage={stage}
                                                            lotId={lotId}
                                                            checkFeature={checkFeature}
                                                            checkPermission={checkPermission}
                                                            isDiscoveryBuilder={isDiscoveryBuilder}
                                            />;
                                    })
                                }
                                {
                                    stage.lots.length === 0 && <tr>
                                        <td colSpan={staticColumnsCount + columnsLength}>No lots found</td>
                                    </tr>
                                }
                                </tbody>
                            </table>
                        )
                    }
                </EstateLotsDataContext.Consumer>
            </div>
        );
    }
}

const StageLotsTableConsumer = (props) => (
    <EstateDataContext.Consumer>
        {
            ({userAction, userActionData, setUserAction, checkPermission, checkFeature}) =>
                <StageLotsTable {...props} {...{
                    userAction,
                    userActionData,
                    setUserAction,
                    checkPermission,
                    checkFeature
                }}/>
        }
    </EstateDataContext.Consumer>
);

export default connect((state => ({
    estateData: state.estate
})), actions)(StageLotsTableConsumer);