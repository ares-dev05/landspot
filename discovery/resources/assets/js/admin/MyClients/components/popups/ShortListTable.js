import React from 'react';
import PropTypes from 'prop-types';

const ShortListTable = ({shortList, onDelete}) => (
    <table className="table short-list_table">
        <tbody>
            {shortList.length ? (
                shortList.map((item, index) => (
                    <tr key={index}>
                        <td width="45%">{item.stage_name}</td>
                        <td width="45%">
                            <span className="my-client-theme-text">
                                Lot {item.lot_number}
                            </span>
                        </td>
                        <td className="actions">
                            <a onClick={() => onDelete(item)}>
                                <i className="landspot-icon trash" />
                            </a>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td className="my-clients-table_one-cell">
                        Table is empty
                    </td>
                </tr>
            )}
        </tbody>
    </table>
);

ShortListTable.propTypes = {
    shortList: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default ShortListTable;
