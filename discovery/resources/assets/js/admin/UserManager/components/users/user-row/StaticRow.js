import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import UserAction from '../consts';
import {clickHandler} from '~/helpers';

const StaticRow = ({
                       user, userIndex, onUserEdit, salesLocations,
                       setUserAction, isBuilder, isGlobalAdmin, isBuilderAdmin,
                       supportRequest, closeAccess, toggleDeleteUser, toggleRestoreUser,
                       userRoles, userDiscoveryLevels, editUserAccess
                   }) => {
    const isSupportRequested = user['is_support_requested'];

    let salesLocation = '';
    if (isBuilder()) {
        salesLocation = salesLocations.find(loc => loc.id === user['sales_location']);
    }
    return (
        <tr>
            <td colSpan='2' className='main-column' title={user['display_name']}>
                {user['display_name']}
                {
                    user.inactive &&
                    <div className='inactive'>45 Days</div>
                }
            </td>
            <td colSpan='2' title={user.email}>
                {user.email}

                {isGlobalAdmin &&
                <React.Fragment>
                    {Boolean(user.phone) &&
                    <React.Fragment>
                        <br/>
                        {user.phone}
                    </React.Fragment>
                    }

                    {Boolean(user.role) &&
                    <React.Fragment>
                        <br/>
                        {userRoles[user['role']]}
                    </React.Fragment>
                    }

                    {Boolean(isBuilder() && user['sales_location']) &&
                    <React.Fragment>
                        <br/>
                        {
                            salesLocation ? salesLocation.name : null
                        }
                    </React.Fragment>
                    }

                    {Boolean(isGlobalAdmin && isBuilder()) &&
                    <React.Fragment>
                        <br/>
                        <b>Discovery:</b><br/>
                        {
                            userDiscoveryLevels[user['chas_discovery']]
                        }
                    </React.Fragment>
                    }
                </React.Fragment>
                }
            </td>
            {
                (isGlobalAdmin || isBuilderAdmin) &&
                <td className='password'>***
                    {
                        user['has_2fa'] &&
                        <button type='button'
                                className='button transparent fa fa-key pull-right'
                                title="Disable two factor authorization"
                                onClick={() => setUserAction(UserAction.RESET_USER_2FA, {user})}
                        />
                    }
                    <button type='button'
                            className='button transparent fa fa-unlock-alt pull-right'
                            title="Send a password reset link"
                            onClick={() => setUserAction(UserAction.SEND_RESET_PASSWORD_LINK, {user})}
                    />
                </td>
            }

            <td className="permissions">
                <button type="button" className="button transparent"
                        onClick={() => editUserAccess()}>
                    <i className='landspot-icon cog'/>
                </button>
            </td>

            {isGlobalAdmin &&
            <React.Fragment>
                <td className='support'>
                    {user['is_grant_support_access'] ? (
                        <React.Fragment>
                            <a className="round-btn"
                               href={`/landspot/user-manager/login/${user.id}`}>
                                Log in as
                            </a>
                            <button type="button"
                                    className="round-btn btn-resolve"
                                    onClick={(e) => clickHandler(e, closeAccess(user.id))}>Resolved
                            </button>
                        </React.Fragment>
                    ) : (
                        <button type="button"
                                className={classnames('round-btn', isSupportRequested ? 'requested' : null)}
                                disabled={isSupportRequested}
                                onClick={isSupportRequested ? null : (e) => clickHandler(e, supportRequest(user.id))}>
                            {isSupportRequested ? 'Requested' : 'Request'}
                        </button>
                    )}
                </td>

                {/*<td className="available permissions" key={'profile'}>*/}
                {/*<a href={`/profile/${user.id}`}*/}
                {/*className="find-houses">Profile</a>*/}
                {/*</td>*/}
            </React.Fragment>
            }
            {
                !isBuilder() &&
                <td>
                    {
                        (user.is_company_admin || user.is_global_estate_manager || user.isGlobalAdmin)
                            ? 'ALL ESTATES'
                            : <button type="button" className="button transparent"
                                      onClick={() => setUserAction(UserAction.EDIT_MANAGER_ESTATES_PERMISSIONS, {user})}>
                                <i className='landspot-icon cog'/> Edit
                            </button>
                    }
                </td>
            }
            {
                (isGlobalAdmin || isBuilderAdmin) &&
                <td>
                    <label className="color-checkbox">
                        <input
                            type="checkbox"
                            disabled={true}
                            checked={user.enabled}
                        />
                        <span className="checkmark"/>
                    </label>
                </td>
            }
            <td className='actions'>
                {
                    isGlobalAdmin
                        ? <React.Fragment>
                            {
                                user.hidden
                                    ? <a onClick={toggleRestoreUser}>
                                        <i className='landspot-icon trash-restore'/>
                                    </a>
                                    : <a onClick={toggleDeleteUser}>
                                        <i className='landspot-icon trash'/>
                                    </a>
                            }
                        </React.Fragment>
                        : <a onClick={toggleDeleteUser}>
                            <i className='landspot-icon trash'/>
                        </a>

                }
                <a onClick={() => onUserEdit(userIndex)}>
                    <i className='landspot-icon pen'/>
                </a>
            </td>
        </tr>

    );
};

StaticRow.propTypes = {
    user: PropTypes.object.isRequired,
    userIndex: PropTypes.number.isRequired,
    isGlobalAdmin: PropTypes.bool.isRequired,
    isBuilder: PropTypes.func.isRequired,
    supportRequest: PropTypes.func.isRequired,
    closeAccess: PropTypes.func.isRequired,
    toggleDeleteUser: PropTypes.func.isRequired,
    toggleRestoreUser: PropTypes.func.isRequired,
    setUserAction: PropTypes.func.isRequired,
    onUserEdit: PropTypes.func.isRequired,
    hasFootprints: PropTypes.func.isRequired,
    isBuilderAdmin: PropTypes.bool,
};

export default StaticRow;