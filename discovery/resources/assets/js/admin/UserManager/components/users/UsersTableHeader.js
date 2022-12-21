import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ToggleButton, clickHandler} from '~/helpers';

const UsersTableHeader = ({
                              company, toggleDisplayNewUser, addNewUserBtnActive,
                              updateCompany, isGlobalAdmin, openCompanyLogosDialog,
                              openSalesLocationDialog, openLotmixVisibilityDialog
                          }) => {
    return (
        <div className='header table-header'>
            <div className="title">
                {
                    // company.company_small_logo &&
                    // <div className="company-logo-small"
                    //      style={{backgroundImage: `url(${company.company_small_logo})`}}/>
                }
                {company.name} - Users
                {
                    isGlobalAdmin && ` (${company.type} company)`
                }
            </div>
            <div className="actions">
                {
                    isGlobalAdmin &&
                    <React.Fragment>
                        {/*<button type="button"
                                    className='button transparent'
                                    onClick={() => openCompanyLogosDialog()}>
                                UPLOAD LOGO
                            </button>*/}
                        {
                            company.type === 'builder' &&
                            <React.Fragment>
                                <ToggleButton
                                    title={company.hasInvitedUsers ? 'This company has Lotmix invited users.' : ''}
                                    disabled={company.hasInvitedUsers}
                                    onClick={() => updateCompany({chas_discovery: company.chas_discovery ? 0 : 1})}
                                    toggledOnText='DISCOVERY ON'
                                    toggledOffText='DISCOVERY OFF'
                                    state={company.chas_discovery > 0}
                                />
                                {company.hasFootprints === 1 &&
                                <ToggleButton
                                    onClick={() => updateCompany({chas_estates_access: company.chas_estates_access ? 0 : 1})}
                                    toggledOnText='LANDSPOT ON'
                                    toggledOffText='LANDSPOT OFF'
                                    state={company.chas_estates_access > 0}
                                />
                                }
                                <a className='button default'
                                   onClick={(e) => clickHandler(e, openLotmixVisibilityDialog)}>
                                    <i className="landspot-icon list"/>
                                    Sitings and Lotmix Permissions
                                </a>
                                <a className='button default'
                                   onClick={(e) => clickHandler(e, openSalesLocationDialog)}>
                                    <i className="landspot-icon list"/>
                                    Sales locations
                                </a>
                            </React.Fragment>
                        }
                    </React.Fragment>
                }
                <a className={classnames('button', addNewUserBtnActive ? 'primary' : 'default')}
                   onClick={(e) => clickHandler(e, toggleDisplayNewUser)}>
                    <i className="landspot-icon plus"/>
                    Add an user
                </a>
            </div>
        </div>
    );
};

UsersTableHeader.propTypes = {
    company: PropTypes.object.isRequired,
    toggleDisplayNewUser: PropTypes.func.isRequired,
    updateCompany: PropTypes.func.isRequired,
    openCompanyLogosDialog: PropTypes.func.isRequired,
    addNewUserBtnActive: PropTypes.bool.isRequired,
    isGlobalAdmin: PropTypes.bool.isRequired,
};

export default UsersTableHeader;