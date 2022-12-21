import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '~/helpers/Tooltip';
import StatusesSelect from './StatusesSelect';
import {clickHandler} from '~/helpers';
import {EstateLotsDataContext} from '../EstateLots';
const NoPriceEditorPermission = 'You cannot edit prices. To request this contact your manager';

const EditableLotRow = ({
                            editableLotItem, editableLotData, columns, lotId, stageId, staticColumnsCount, checkPermission,
                        }) => {
    const editingLot = editableLotItem !== null && editableLotItem !== undefined && editableLotItem.lotId;

    const getValue = (columnID) => {
        return editableLotData[columnID] || '';
    };

    const getInputType = (attrName) => {
        switch (attrName) {
            case 'area':
            // case 'frontage':
            case 'depth':
            case 'price':
                return 'number';
        }
        return 'text';
    };
    let staticCells = [];
    while (staticColumnsCount-- > 1) {
        staticCells.push(<td key={'e' + staticColumnsCount}/>);
    }

    return (
        <EstateLotsDataContext.Consumer>
            {
                ({saveLotHandler, onLotInputChange, state: {errors}}) => (
                    <tr>
                        {
                            columns.map((column, columnIndex) =>
                                <td key={columnIndex}>
                                    {
                                        column['attr_name'] === 'status'
                                            ? (
                                                <StatusesSelect attrId={column.id}
                                                                onLotInputChange={onLotInputChange}
                                                                editableLotData={editableLotData}
                                                                editableLotItem={editableLotItem}
                                                                rowIndex={columnIndex}/>
                                            )
                                            : (
                                                !checkPermission('price_editor') && column['attr_name'] === 'price'
                                                    ? (
                                                        editingLot
                                                            ? <Tooltip text={NoPriceEditorPermission}>
                                                                {getValue(column.id)}
                                                            </Tooltip>
                                                            : <input style={{width: '100%'}}
                                                                     type={getInputType(column['attr_name'])}
                                                                     disabled="disabled"
                                                                     defaultValue={null}
                                                            />

                                                    ) : (
                                                        <input style={{width: '100%'}}
                                                               className={errors[columnIndex] ? 'required-field' : null}
                                                               type={getInputType(column['attr_name'])}
                                                               maxLength={64}
                                                               min="0"
                                                               onChange={(e) => onLotInputChange({[column.id]: e.target.value})}
                                                               defaultValue={getValue(column.id, columnIndex)}/>
                                                    )
                                            )
                                    }
                                </td>
                            )
                        }
                        {staticCells}
                        <td>
                            <a href="#"
                               aria-hidden="true"
                               onClick={(e) => clickHandler(e, saveLotHandler(lotId || null, stageId))}>
                                <i className="fal fa-save"/>
                            </a>
                        </td>
                    </tr>
                )
            }
        </EstateLotsDataContext.Consumer>
    );
};

EditableLotRow.propTypes = {
    editableLotData: PropTypes.object,
    editableLotItem: PropTypes.object,
    columns: PropTypes.array,

    lotId: PropTypes.number,
    stageId: PropTypes.number,
    staticColumnsCount: PropTypes.number,

    checkPermission: PropTypes.func.isRequired,
};

export default EditableLotRow;