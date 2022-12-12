import React from 'react';
import PropTypes from 'prop-types';
import UserAction from '../constants';
import EstateShortListModal from './EstateShortListModal';
import EditInvitedUserModal from './EditInvitedUserModal';
import InviteClientModal from './InviteClientModal';
import SitingsModal from './SitingsModal';
import ShareClientAccessModal from './ShareClientAccessModal';
import {ConfirmDialog} from '~/popup-dialog/PopupModal';
import DetailsModal from './DetailsModal/DetailsModalComponent';
import DraftInvitePopup from './DraftInvitePopup';
import BriefModal from './DetailsModal/BriefModalComponent';
import ShareDraftSitingAccessModal from './ShareDraftSitingAccessModal';
import SitingDetails from './SitingDetails';

const DialogList = ({
                        userAction,
                        setUserAction,
                        userActionData,
                        updateMyClientsTable,
                        onDeleteClient,
                        onDelteSiting,
                        isBuilder,
                        is_brief_admin
                    }) => {
    switch (userAction) {
        case UserAction.SHOW_DRAFT_SITING_ACCESS_DIALOG:
            return (
                <ShareDraftSitingAccessModal
                    onCancel={() => setUserAction(null)}
                    siting={userActionData}
                />
            );
        case UserAction.SHOW_SHORT_LIST_DIALOG:
            return (
                <EstateShortListModal
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_SITING_DETAILS:
            return (
                <SitingDetails
                    onSetUserAction={setUserAction}
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_INVITED_USER_DETAILS_DIALOG:
            return (
                <DetailsModal
                    isBuilder={isBuilder}
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                    is_brief_admin={is_brief_admin}
                />
            );
        case UserAction.SHOW_LEGACY_SITINGS_DIALOG:
            return (
                <SitingsModal
                    onSetUserAction={setUserAction}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_EDIT_USER_DIALOG:
            return (
                <EditInvitedUserModal
                    onUpdateMyClientsTable={updateMyClientsTable}
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_INVITE_CLIENT_DIALOG:
            return (
                <InviteClientModal
                    onCancel={() => setUserAction(null)}
                    isBuilder={isBuilder}
                />
            );
        case UserAction.SHOW_DRAFT_INVITE_CLIENT_DIALOG:
            return (
                <DraftInvitePopup
                    onCancel={() => setUserAction(null)}
                    isBuilder={isBuilder}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_ACCESS_DIALOG:
            return (
                <ShareClientAccessModal
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                />
            );
        case UserAction.SHOW_CONFIRM_DELETE_MY_CLIENT_DIALOG:
            return (
                <ConfirmDialog
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                    onConfirm={() => onDeleteClient({id: userActionData.id})}
                >
                    <p>
                        Are you sure wish to delete the client{' '}
                        <b>
                            {userActionData.first_name}{' '}
                            {userActionData.last_name}
                        </b>
                        ?
                    </p>
                </ConfirmDialog>
            );
        case UserAction.SHOW_CONFIRM_DELETE_SITING_DIALOG:
            return (
                <ConfirmDialog
                    onCancel={() => setUserAction(null)}
                    userActionData={userActionData}
                    onConfirm={() => onDelteSiting({id: userActionData.id})}
                >
                    <p>
                        Are you sure wish to delete the siting?
                    </p>
                </ConfirmDialog>
            );
        case UserAction.SHOW_REVIEW_BRIEF_DIALOG:
            return (
                <BriefModal
                    onCancel={() => setUserAction(null)}
                    setUserAction={setUserAction}
                    userActionData={userActionData}
                />
            );
    }
    return null;
};

DialogList.propTypes = {
    userAction: PropTypes.symbol,
    userActionData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setUserAction: PropTypes.func.isRequired,
    isBuilder: PropTypes.bool.isRequired,
    updateMyClientsTable: PropTypes.func,
    onDeleteClient: PropTypes.func
};

DialogList.defaultProps = {
    updateMyClientsTable: () => {
    },
    onDeleteClient: () => {
    },
    userAction: Symbol('')
};

export default DialogList;
