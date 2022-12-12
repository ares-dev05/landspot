import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import NiceDropdown from '~/helpers/NiceDropdown';
import UserAction from '../consts';

const EditableRow = ({
                         onUserInputChange,
                         saveUserHandler,
                         editableUserData,
                         errors,
                         statesList,
                         userId,
                         isGlobalAdmin,
                         isBuilderAdmin,
                         isBuilder,
                         salesLocationsList,
                         userRolesList,
                         userAction
                     }) => {
    const getValue = (columnID) => {
        return editableUserData[columnID] || '';
    };

    const formatPhoneNumber = (phone) => {
        return phone.replace(/^\+61/, '0');
    };

    return (
        <tr>
            <td colSpan="2" className='landspot-input'>
                <div className={classnames('landspot-input', errors['display_name'] ? 'has-error' : null)}>
                    <input style={{width: '100%'}}
                           type='text'
                           onChange={(e) => onUserInputChange({display_name: e.target.value})}
                           placeholder='Name'
                           defaultValue={getValue('display_name')}/>
                </div>
            </td>
            <td colSpan="2" className='contact-details landspot-input'>
                <div className={classnames('landspot-input', errors['email'] ? 'has-error' : null)}>
                    <input style={{width: '100%'}}
                           type='text'
                           onChange={(e) => onUserInputChange({email: e.target.value})}
                           placeholder='Email'
                           defaultValue={getValue('email')}/>
                </div>

                {
                    isGlobalAdmin &&
                    <div className={classnames('landspot-input input-group', errors['phone'] ? 'has-error' : null)}>
                        <div className="input-group-addon">
                            +61
                        </div>
                        <input style={{width: '100%'}}
                               type='text'
                               onChange={e => onUserInputChange({phone: `${e.target.value.replace(/^\+61/, '0')}`})}
                               placeholder='Phone'
                               maxLength={16}
                               defaultValue={formatPhoneNumber(getValue('phone'))}/>
                    </div>
                }

                {
                    (isGlobalAdmin || !isBuilderAdmin) &&
                    <NiceDropdown
                        itemClass={errors['role'] ? 'has-error' : ''}
                        defaultItem='Select role'
                        defaultValue={null}
                        items={userRolesList()}
                        onChange={(role) => onUserInputChange({role})}
                        value={parseInt(getValue('role')) || null}
                    />
                }
                {
                    isBuilder() &&
                    <React.Fragment>
                        {
                            isGlobalAdmin &&
                            <NiceDropdown
                                itemClass={errors['sales_location'] ? 'has-error' : ''}
                                defaultItem='Select sales location'
                                defaultValue={0}
                                items={salesLocationsList()}
                                onChange={(sales_location) => onUserInputChange({sales_location})}
                                value={getValue('sales_location')}
                            />
                            // :
                            // <div className='landspot-input'>
                            //     <input readOnly={true}
                            //            type='text'
                            //            placeholder='Sales location'
                            //            defaultValue={getValue('sales_location')}
                            //     />
                            // </div>
                        }
                    </React.Fragment>
                }
                {
                    (isGlobalAdmin || isBuilderAdmin) &&
                    <React.Fragment>
                        <NiceDropdown
                            itemClass={errors['state_id'] ? 'has-error' : ''}
                            defaultItem='Select state'
                            defaultValue={0}
                            items={statesList()}
                            onChange={(state_id) => onUserInputChange({state_id})}
                            value={parseInt(getValue('state_id')) || 0}
                        />
                    </React.Fragment>
                }
            </td>
            {
                isGlobalAdmin &&
                <td className='landspot-input'>
                    <input style={{width: '100%'}}
                           type='password'
                           onChange={(e) => onUserInputChange({password: e.target.value})}
                           placeholder='Password'
                           defaultValue=''/>
                </td>
            }
            {
                (!isGlobalAdmin && isBuilderAdmin) &&
                <td className='landspot-input'>
                    ***
                </td>
            }
            <td/>
            {
                isGlobalAdmin &&
                <React.Fragment>
                    <td/>
                    {!isBuilder() && <td key={'estate-permission'}/>}
                    {/*<td key={'profile'}/>*/}
                </React.Fragment>
            }
            {
                (isGlobalAdmin || isBuilderAdmin) &&
                <td className='landspot-input enabled-checkbox'>
                    {
                        userAction !== UserAction.ADD_USER &&
                        <label className="color-checkbox">
                            <input
                                type="checkbox"
                                checked={!!getValue('enabled')}
                                onChange={() => onUserInputChange({enabled: !getValue('enabled')})}
                            />
                            <span className="checkmark"/>
                        </label>
                    }
                </td>
            }
            {!isGlobalAdmin && !isBuilder() && <td/>}
            <td className='actions'>
                <a onClick={() => saveUserHandler(userId || null)}>
                    <i className="fal fa-save"/>
                </a>
            </td>
        </tr>
    );
};

EditableRow.propTypes = {
    isGlobalAdmin: PropTypes.bool.isRequired,
    isBuilder: PropTypes.func.isRequired,
    isBuilderAdmin: PropTypes.bool.isRequired,
    userId: PropTypes.number,
    statesList: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    editableUserItem: PropTypes.object,
    editableUserData: PropTypes.object,

    saveUserHandler: PropTypes.func.isRequired,
    onUserInputChange: PropTypes.func.isRequired,
    userDiscoveryLevelsList: PropTypes.func,
};

export default EditableRow;