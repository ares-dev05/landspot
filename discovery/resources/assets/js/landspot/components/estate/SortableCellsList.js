import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {EstateLotsDataContext} from './EstateLots';

const SortableItem = SortableElement(({value, getSortClass, className, isSortableGhost}) => {
    return (
        <th className={classnames(className, 'movable')}>
            <div className={isSortableGhost ? 'invisible' : ''}>
                <i className="landspot-icon bars"/>
                <a href="#"
                   aria-hidden="true">
                    {value.display_name}
                </a>
            </div>
        </th>
    );
});

SortableItem.propTypes = {
    value: PropTypes.object.isRequired,
    getSortClass: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    isSortableGhost: PropTypes.bool.isRequired,
};

const SortableCellsList = SortableContainer(({columns, checkPermission}) => {
    return (
        <EstateLotsDataContext.Consumer>
            {
                ({getSortClass, getColumnIndex, state: {moveIndex}}) => (
                    <tr>
                        {columns.map((column, columnIndex) =>
                            <SortableItem key={`item-${columnIndex}`} index={columnIndex} getSortClass={getSortClass}
                                          isSortableGhost={moveIndex === columnIndex}
                                          value={column}
                                          className={getColumnIndex('status') === columnIndex ? 'status-column' : ''}
                            />
                        )}
                        {!checkPermission('read_only')
                            ? ([
                                <th key={'packages'}>Packages</th>,
                                <th key={'discovery'}>Discovery</th>,
                                <th key={'visibility'}>Visibility</th>,
                                <th key={'edit'}>Edit</th>
                            ])
                            : ([
                                <th key={'packages'}>Packages</th>,
                                <th key={'discovery'}>Discovery</th>
                            ])}
                    </tr>
                )
            }
        </EstateLotsDataContext.Consumer>
    );
});

SortableCellsList.propTypes = {
    helperClass: PropTypes.string,
    axis: PropTypes.string,
    hideSortableGhost: PropTypes.bool,
    columns: PropTypes.array.isRequired,
    checkPermission: PropTypes.func.isRequired,
    onSortEnd: PropTypes.func.isRequired,
    onSortStart: PropTypes.func.isRequired,
};

export default SortableCellsList;