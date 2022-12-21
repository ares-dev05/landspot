import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import NiceDropdown from '~/helpers/NiceDropdown';

const PORTAL_ACCESS_SITINGS = 0;
const PORTAL_ACCESS_BUILDER = 1;
const PORTAL_ACCESS_CONTRACTOR = 2;
const PORTAL_ACCESS_ADMIN = 3;

// const SitingsAccessLevels = {
//     [PORTAL_ACCESS_SITINGS]: 'No access',
//     [PORTAL_ACCESS_BUILDER]: 'Builder',
//     [PORTAL_ACCESS_CONTRACTOR]: 'Contractor',
//     [PORTAL_ACCESS_ADMIN]: 'Admin'
// };

class UserAccessDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            preloader: false
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidMount() {
        const {editableUserData} = this.props.userActionData;
        this.setState({user: editableUserData});
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            popupDialog: {message, errors: propsErrors},
            alert: {show, error},
            resetDialogStore,
        } = this.props;
        const {preloader} = this.state;

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false});
        }

        if (message && message.success) {
            show(
                message.success,
                {
                    type: 'success',
                }
            );
            resetDialogStore();
        }

        if (propsErrors) {
            let errors = [];
            typeof propsErrors === 'object'
                ? Object.keys(propsErrors).forEach((error, i) => {
                    const column = propsErrors[error];
                    errors[i] = {
                        message: `${column}`,
                    };
                })
                : errors.push(propsErrors);

            if (errors.length) {
                error(errors.map(
                    (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
                ));
            }
            resetDialogStore();
        }

    }

    onUserInputChange = (data) => {
        const {
            userActionData: {
                onUserInputChange
            }
        } = this.props;
        const {user: stateUser} = this.state;

        const user = {
            ...stateUser, ...data
        };

        this.setState({user});
        onUserInputChange(data);
    };

    saveUser = () => {
        const {
            userActionData: {
                saveUserHandler
            }
        } = this.props;
        const {user} = this.state;
        saveUserHandler(user.id);
        this.setState({preloader: true});
    };

    render() {
        const {user, preloader} = this.state;
        const {
            onCancel,
            userActionData: {
                isBuilder,
                isGlobalAdmin,
                isBuilderAdmin,
                userDiscoveryLevelsList,
                isLandconnect,
                hasFootprints
            }
        } = this.props;
        return (
            <PopupModal dialogClassName={'sales-locations overflow-unset'}
                        title={'Manage user access'}
                        onOK={this.saveUser}
                        onModalHide={onCancel}
            >
                <React.Fragment>
                    {user === null
                        ? <LoadingSpinner className={'overlay'}/>
                        : <UserAccess user={user}
                                      isBuilder={isBuilder}
                                      isGlobalAdmin={isGlobalAdmin}
                                      isBuilderAdmin={isBuilderAdmin}
                                      hasFootprints={hasFootprints}
                                      isLandconnect={isLandconnect}
                                      userDiscoveryLevelsList={userDiscoveryLevelsList}
                                      onUserInputChange={this.onUserInputChange}/>
                    }

                    {preloader && <LoadingSpinner className={'overlay'}/>}
                </React.Fragment>
            </PopupModal>
        );
    }
}

const labels = {
    is_user_manager: 'User Manager',
    is_global_estate_manager: 'Global estate manager',
    is_discovery_manager: 'Discovery Manager',
    disabled_estates_access: 'Estates access disabled',
    is_company_admin: 'Company Admin',
    disabled_email_notifications: 'Email Notifications',
    has_lotmix_access: 'Lotmix Access',
    draft_feature: 'Draft Feature',
    is_brief_admin: 'Brief Access',
    has_portal_access: 'Plan Portal Access',
    has_exclusive: 'Exclusive Access',
    has_all_sittings: 'All Sitings'
};

const UserAccess = ({
                        user,
                        isBuilder,
                        isGlobalAdmin,
                        isBuilderAdmin,
                        hasFootprints,
                        userDiscoveryLevelsList,
                        isLandconnect,
                        onUserInputChange
                    }) => {
    const getValue = (columnID) => {
        return user[columnID] || 0;
    };

    const isCompanyAdmin = parseInt(getValue('is_company_admin')) === 1;

    return (
        <div className="form-rows">
            {!isBuilder() &&
            ['is_user_manager', 'is_global_estate_manager', 'has_lotmix_access'].map(
                column => <div key={column} className="form-row">
                    {!isCompanyAdmin &&
                    <NiceCheckbox
                        checked={parseInt(getValue(column)) === 1}
                        label={labels[column]}
                        name={column}
                        onChange={() => onUserInputChange({[column]: parseInt(getValue(column)) ? 0 : 1})}
                    />
                    }
                </div>
            )}

            {(isBuilderAdmin || isGlobalAdmin) &&
            <React.Fragment>
                <div className="form-row">
                    <NiceCheckbox
                        checked={parseInt(getValue('has_exclusive')) === 1}
                        label={labels['has_exclusive']}
                        name={'has_exclusive'}
                        onChange={() => onUserInputChange({'has_exclusive': parseInt(getValue('has_exclusive')) ? 0 : 1})}
                    />
                </div>
                <div className="form-row">
                    <NiceCheckbox
                        checked={parseInt(getValue('has_portal_access')) === PORTAL_ACCESS_BUILDER}
                        name={labels['has_portal_access']}
                        label={labels.has_portal_access}
                        onChange={() => onUserInputChange({
                            'has_portal_access': parseInt(getValue('has_portal_access')) === PORTAL_ACCESS_BUILDER ? 0 : PORTAL_ACCESS_BUILDER
                        })}
                    />
                </div>
            </React.Fragment>
            }

            {
                isGlobalAdmin &&
                <React.Fragment>
                    {((isBuilder() && hasFootprints())
                        ? ['disabled_estates_access', 'is_company_admin', 'draft_feature', 'is_brief_admin']
                        : ['is_company_admin', 'draft_feature', 'is_brief_admin']).map(
                        column => <div key={column} className="form-row">
                            <NiceCheckbox
                                checked={parseInt(getValue(column)) === 1}
                                label={labels[column]}
                                name={column}
                                onChange={() => onUserInputChange({[column]: parseInt(getValue(column)) ? 0 : 1})}
                            />
                        </div>
                    )}
                    <div className="form-row">
                        <NiceCheckbox
                            checked={parseInt(getValue('disabled_email_notifications')) === 0}
                            name={'user-email-notifications'}
                            label={labels.disabled_email_notifications}
                            onChange={() => onUserInputChange({
                                'disabled_email_notifications': parseInt(getValue('disabled_email_notifications')) ? 0 : 1
                            })}
                        />
                    </div>
                    <div className="form-row">
                        <NiceCheckbox
                            checked={parseInt(getValue('has_all_sitings')) === 1}
                            name={'has_all_sitings'}
                            label={labels.has_all_sittings}
                            onChange={() => onUserInputChange({
                                'has_all_sitings': parseInt(getValue('has_all_sitings')) ? 0 : 1
                            })}
                        />
                    </div>
                    {(isBuilder() && hasFootprints()) &&
                    <React.Fragment>
                        {/*<div className="form-row">*/}
                        {/*<NiceCheckbox*/}
                        {/*checked={hasFootprints()}*/}
                        {/*name={'sitings-access'}*/}
                        {/*label="Sitings Access"*/}
                        {/*onChange={() => onUserInputChange({*/}
                        {/*// 'has_portal_access': parseInt(getValue('has_portal_access')) === PORTAL_ACCESS_SITINGS ? 0 : PORTAL_ACCESS_SITINGS*/}
                        {/*})}*/}
                        {/*/>*/}
                        {/*</div>*/}
                    </React.Fragment>
                    }
                    <div className="form-row">
                        <label className="left-item">Discovery Access Level</label>
                        <NiceDropdown
                            itemClass='right-item'
                            defaultItem='Select Discovery Access Level'
                            defaultValue={0}
                            items={userDiscoveryLevelsList()}
                            onChange={(chas_discovery) => onUserInputChange({chas_discovery})}
                            value={parseInt(getValue('chas_discovery')) || 0}
                        />
                    </div>
                </React.Fragment>
            }

            {
                isLandconnect &&
                <div className="form-row">
                    <NiceCheckbox
                        checked={parseInt(getValue('has_portal_access')) === PORTAL_ACCESS_CONTRACTOR}
                        name={'contractor'}
                        label="Contractor"
                        onChange={() => onUserInputChange({
                            'has_portal_access': parseInt(getValue('has_portal_access')) === PORTAL_ACCESS_CONTRACTOR ? 0 : PORTAL_ACCESS_CONTRACTOR
                        })}
                    />
                </div>
            }

            {
                // isGlobalAdmin &&
                // <div className="form-row">
                //     <label className="left-item">Portal Access Level</label>
                //     <NiceDropdown
                //         itemClass='right-item'
                //         defaultItem='Select Portal Access Level'
                //         defaultValue={PORTAL_ACCESS_SITINGS}
                //         items={
                //             Object.keys(SitingsAccessLevels)
                //                 .filter(value => (isBuilder() || value !== String(PORTAL_ACCESS_BUILDER)))
                //                 .map(value => ({text: SitingsAccessLevels[value], value}))
                //         }
                //         onChange={(has_portal_access) => onUserInputChange({has_portal_access})}
                //         value={parseInt(getValue('has_portal_access')) || 0}
                //     />
                // </div>
            }
        </div>
    );
};

UserAccess.propTypes = {
    user: PropTypes.object.isRequired,
    isGlobalAdmin: PropTypes.bool.isRequired,
    isBuilderAdmin: PropTypes.bool.isRequired,
    isBuilder: PropTypes.func.isRequired,
    hasFootprints: PropTypes.func.isRequired,
    onUserInputChange: PropTypes.func.isRequired,
    userDiscoveryLevelsList: PropTypes.func.isRequired,
};

export default withAlert(withRouter(connect(
    (state => ({
        popupDialog: state.popupDialog,
        company: state.users.company,
    })), actions
)(UserAccessDialog)));