import React, {Fragment} from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {clickHandler} from '~/helpers';
import MenuList from '../../../helpers/MenuList';
import {EstateDataContext} from '../Estate-new';
import UserAction from './consts';
import {EstateLotsDataContext} from './EstateLots';
import BulkUpdateLot from './BulkUpdateLot';


const HeaderCellsList = ({
                             columns, isBuilder, onRemove, stage
                         }) => {
    return (
        <EstateDataContext.Consumer>
            {
                ({userActionData, userAction, setUserAction, checkPermission, checkFeature}) => {
                    const displayNewColumn = userAction === UserAction.ADD_COLUMN;
                    const editColumn = userAction === UserAction.EDIT_COLUMN;
                    const newColumnName = userActionData && userActionData.newColumnName;
                    const columnId = userActionData && userActionData.columnId;
                    const showBulkUpdateTooltip = userAction === UserAction.BULK_UPDATE_LOT
                        && stage.id === (userActionData && userActionData.stageId);

                    return (
                        <EstateLotsDataContext.Consumer>
                            {
                                ({getOrderType, getSortClass, filterLots, getColumnIndex}) => (
                                    <tr>
                                        {
                                            columns.map((column, columnIndex) =>
                                                <th key={columnIndex}
                                                    className={
                                                        classnames(
                                                            getColumnIndex('status') === columnIndex && 'status-column',
                                                            column.column_type === 'dynamic' && 'has-menu'
                                                        )
                                                    }
                                                    title={column.display_name}>

                                                    {(editColumn && columnId === column.id)
                                                        ? <div className="landspot-input">
                                                            <input type="text"
                                                                   className='column-name'
                                                                   style={{width: '100%'}}
                                                                   placeholder="Column name"
                                                                   onChange={e => setUserAction(UserAction.EDIT_COLUMN, {
                                                                       columnId: column.id,
                                                                       newColumnName: e.target.value
                                                                   })}
                                                                   value={newColumnName}/>
                                                        </div>
                                                        : <Fragment>
                                                            {
                                                                <React.Fragment>
                                                                    {
                                                                        column.attr_name !== 'title_date'
                                                                            ? <a href="#"
                                                                                 className="ellipsis"
                                                                                 aria-hidden="true"
                                                                                 onClick={(e) => {
                                                                                     clickHandler(e, filterLots, [{
                                                                                         order: column.order,
                                                                                         order_type: getOrderType(column.order)
                                                                                     }]);
                                                                                 }}>
                                                                                <i className={getSortClass(column.order)}
                                                                                   aria-hidden="true"/>
                                                                                <span
                                                                                    className='column-name'>{column.display_name}</span>
                                                                            </a>
                                                                            : <span>{column.display_name}</span>
                                                                    }
                                                                    {
                                                                        !isBuilder
                                                                        && (column.attr_name === 'title_date'
                                                                            || (column.attr_name === 'price'
                                                                                && checkPermission('price_editor')
                                                                            )
                                                                        ) &&
                                                                        <React.Fragment>
                                                                            <a href="#"
                                                                               className="ellipsis edit-icon"
                                                                               aria-hidden="true"
                                                                               onClick={() => {
                                                                                   setUserAction(UserAction.BULK_UPDATE_LOT, {
                                                                                       stageId: stage.id,
                                                                                       columnId: column.id,
                                                                                       columnName: column.attr_name,
                                                                                       lotIds: stage.lotIds
                                                                                   });
                                                                               }}>
                                                                                <i className="landspot-icon pen"/>
                                                                            </a>
                                                                            {
                                                                                (userActionData
                                                                                    && showBulkUpdateTooltip
                                                                                    && column.id === userActionData.columnId) &&
                                                                                <BulkUpdateLot
                                                                                    placeholder={column.display_name}
                                                                                    column={column.attr_name}
                                                                                />
                                                                            }
                                                                        </React.Fragment>
                                                                    }
                                                                </React.Fragment>
                                                            }

                                                            {
                                                                !isBuilder && column.column_type === 'dynamic' &&
                                                                <MenuList
                                                                    placement='right'
                                                                    items={[
                                                                        {
                                                                            text: '<i class="landspot-icon trash"></i>Delete column',
                                                                            handler: () => onRemove(column.order)
                                                                        }, {
                                                                            text: '<i class="landspot-icon pen"></i>Rename',
                                                                            handler: () => setUserAction(UserAction.EDIT_COLUMN, {
                                                                                columnId: column.id,
                                                                                newColumnName: column.display_name
                                                                            })
                                                                        }]
                                                                    }
                                                                />
                                                            }
                                                        </Fragment>
                                                    }
                                                </th>
                                            )}
                                        {
                                            displayNewColumn &&
                                            <th>
                                                <div className="landspot-input">
                                                    <input type="text"
                                                           style={{width: '100%'}}
                                                           placeholder="Column name"
                                                           className='column-name'
                                                           onChange={e => setUserAction(UserAction.ADD_COLUMN, {
                                                               newColumnName: e.target.value
                                                           })}
                                                           value={newColumnName}/>
                                                </div>
                                            </th>
                                        }
                                        {
                                            (isBuilder ? BuilderHeaderCells() : !checkPermission('read_only') ? AdminHeaderCells(checkFeature, checkPermission) : ['Packages', 'Discovery']).map((column, columnIndex) =>
                                                <th key={columnIndex}>
                                                    <div title={column} className="ellipsis">{column}</div>
                                                </th>)
                                        }
                                    </tr>
                                )}
                        </EstateLotsDataContext.Consumer>
                    );
                }}
        </EstateDataContext.Consumer>
    );
};

HeaderCellsList.propTypes = {
    columns: PropTypes.array.isRequired,
    isBuilder: PropTypes.bool.isRequired,
    onRemove: PropTypes.func.isRequired,
};

const BuilderHeaderCells = () => {
    return ['Discovery', 'Packages'];
};

const AdminHeaderCells = (checkFeature, checkPermission) => {
    const isLotmix = checkFeature('lotmix') && checkPermission('lotmix');
    const columns = isLotmix ? ['Lotmix'] : [];
    columns.push(...['Packages', 'Discovery', 'Visibility', 'Edit']);

    return columns;
};

export default HeaderCellsList;