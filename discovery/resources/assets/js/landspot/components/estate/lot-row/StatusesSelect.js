import React from 'react';
import PropTypes from 'prop-types';
import NiceDropdown from '~/helpers/NiceDropdown';

const StatusesSelect = ({
                            onLotInputChange, editableLotData, editableLotItem, attrId,
                            isStaticCell, onLotCellStatusChange, statusValue
                        }) => {

    const editingLot = editableLotItem !== null && editableLotItem !== undefined;

    const getValue = (columnID) => {
        if (editingLot) {
            return editableLotData[columnID];
        } else {
            return statusValue || '';
        }
    };

    const value = getValue(attrId);

    return (
        <NiceDropdown
            itemClass={'status'}
            defaultItem={null}
            items={['Available', 'Deposit', 'On Hold', 'Sold'].map(value => ({text: value, value}))}
            value={value}
            onChange={
                value => {
                    editingLot && onLotInputChange({[attrId]: value});
                    isStaticCell && onLotCellStatusChange(value);
                }
            }
        />
    );
};

StatusesSelect.propTypes = {
    editableLotData: PropTypes.object,
    editableLotItem: PropTypes.object,
    attrId: PropTypes.number,
    isStaticCell: PropTypes.bool,
    statusValue: PropTypes.string,
    onLotCellStatusChange: PropTypes.func,
    onLotInputChange: PropTypes.func
};

export default StatusesSelect;