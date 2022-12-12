import React from 'react';
import {getImageForMedia} from '~/helpers';
import UserAction from './consts';
import PropTypes from 'prop-types';

const EstateList = ({estates, onUserRemove, setUserAction}) => {
    return (
        estates.length
            ? <table className="table users">
                <thead>
                <tr>
                    <th className="th-estate-table" scope="col">
                        ESTATE NAME
                    </th>
                    <th scope="col">
                        USERS
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    estates.map(
                        estate => <EstateRow
                            key={estate.id}
                            onUserRemove={onUserRemove}
                            setUserAction={setUserAction}
                            {...estate}
                        />
                    )
                }
                </tbody>
            </table>
            : <div className="no-results">
                There are no results that match your search
            </div>
    );
};

const EstateRow = ({id, name, managers, onUserRemove, setUserAction}) => (
    <tr>
        <td>{name}</td>
        <td>
            {
                managers.length > 0
                    ?
                    managers.map(manager =>
                        <p className='estate-manager'
                           key={manager.id}>{manager['display_name']}
                            <i className="fal fa-times"
                               onClick={() => onUserRemove('user', manager.id, manager, id)}/>
                        </p>
                    )
                    : 'All users'
            }

            <p className='manage-users'
               onClick={() => setUserAction(UserAction.ADD_USER, {estateId: id})}>
                <i className="fal fa-plus-circle"/>Manage users
            </p>
        </td>
    </tr>
);

EstateList.propTypes = {
    estates: PropTypes.array.isRequired,
    setUserAction: PropTypes.func.isRequired,
    onUserRemove: PropTypes.func.isRequired,
};

export default EstateList;