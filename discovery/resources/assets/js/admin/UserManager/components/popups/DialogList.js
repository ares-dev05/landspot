import React from 'react';
import {ConfirmDeleteDialog, ConfirmRestoreDialog} from '~/popup-dialog/PopupModal';
import UserAction from '../users/consts';
import SendResetPasswordLinkDialog from './SendResetPasswordLinkDialog';
import ResetUser2FADialog from './ResetUser2FADialog';
import CompanyLogosDialogue from './CompanyLogosDialogue';
import EditEstatesManagerPermissions from './EditEstatesManagerPermissions';
import SalesLocationsDialogue from './SalesLocationsDialogue';
import LotmixVisibilityDialogue from './LotmixVisibilityDialogue';
import UserAccessDialog from './UserAccessDialog';
import PropTypes from 'prop-types';

const DialogList = ({
                        userAction, userActionData,
                        sendResetPasswordLink,
                        resetUser2FA,
                        setUserAction,
                        removeHandler,
                        restoreHandler
                    }) => {

    switch (userAction) {
        case UserAction.CONFIRM_REMOVE_ITEM:
            if (userActionData) {
                return <ConfirmDeleteDialog onConfirm={removeHandler}
                                            userActionData={userActionData}
                                            onCancel={() => {
                                                setUserAction(null);
                                            }}
                />;

            }
            break;

        case UserAction.CONFIRM_RESTORE_ITEM:
            if (userActionData) {
                return <ConfirmRestoreDialog onConfirm={restoreHandler}
                                            userActionData={userActionData}
                                            onCancel={() => {
                                                setUserAction(null);
                                            }}
                />;

            }
            break;

        case UserAction.SEND_RESET_PASSWORD_LINK:
            return <SendResetPasswordLinkDialog onConfirm={() => sendResetPasswordLink(null, userActionData.user)}
                                                userActionData={userActionData}
                                                onCancel={() => {
                                                    setUserAction(null);
                                                }}
            />;
        case UserAction.RESET_USER_2FA:
            return <ResetUser2FADialog onConfirm={() => resetUser2FA(userActionData.user)}
                                       userActionData={userActionData}
                                       onCancel={() => {
                                           setUserAction(null);
                                       }}
            />;

        case UserAction.OPEN_COMPANY_LOGOS_DIALOGUE:
            return <CompanyLogosDialogue userActionData={userActionData}
                                         onCancel={() => {
                                             setUserAction(null);
                                         }}
            />;

        case UserAction.OPEN_SALES_LOCATION_DIALOGUE:
            return <SalesLocationsDialogue userActionData={userActionData}
                                           onCancel={() => {
                                               setUserAction(null);
                                           }}
            />;

        case UserAction.OPEN_LOTMIX_VISIBILITY_DIALOGUE:
            return <LotmixVisibilityDialogue userActionData={userActionData}
                                             onCancel={() => {
                                                 setUserAction(null);
                                             }}
            />;


        case UserAction.EDIT_MANAGER_ESTATES_PERMISSIONS:
            return <EditEstatesManagerPermissions
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
            />;

        case UserAction.EDIT_USER_ACCESS:
            return <UserAccessDialog
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
            />;
    }
    return null;
};

DialogList.propTypes = {
    userAction: PropTypes.symbol,
    userActionData: PropTypes.object,
    sendResetPasswordLink: PropTypes.func.isRequired,
    resetUser2FA: PropTypes.func.isRequired,
    setUserAction: PropTypes.func.isRequired,
    removeHandler: PropTypes.func.isRequired,
    restoreHandler: PropTypes.func.isRequired
};

export default DialogList;