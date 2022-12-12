import React from 'react';
import PropTypes from 'prop-types';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import UserAction from '../consts';
import ConfirmDeleteRangeDialog from './ConfirmDeleteRangeDialog';
import EditDetailsDialog from './EditDetailsDialog';
import EditHouseMediaDialog from './EditHouseMediaDialog';
import AddHouseDialog from './AddHouseDialog';
import FacadeBulkUploaderDialog from './FacadeBulkUploaderDialog';
import StandardInclusionsDialog from './StandardInclusionsDialog';
import LotmixProfileDialog from './LotmixProfileDialog';

const DialogList = ({
                        userAction, userActionData,
                        removeHandler, setUserAction, getHouses, company
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

        case UserAction.SHOW_REMOVE_RANGE_DIALOG:
            return <ConfirmDeleteRangeDialog
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
                removeHandler={removeHandler}
            />;

        case UserAction.SHOW_DETAILS_DIALOG:
            return <EditDetailsDialog
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
                getHouses={getHouses}
            />;

        case UserAction.SHOW_ADD_HOUSE_DIALOG:
            return <AddHouseDialog
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
                getHouses={getHouses}
            />;

        case UserAction.SHOW_HOUSE_MEDIA_DIALOG:
            return <EditHouseMediaDialog
                onCancel={() => setUserAction(null)}
                setUserAction={setUserAction}
                userActionData={userActionData}
            />;

            case UserAction.SHOW_FACADE_BULK_UPLOADER_DIALOG:
            return <FacadeBulkUploaderDialog
                onOk={() => setUserAction(
                    UserAction.SHOW_HOUSE_MEDIA_DIALOG, {
                        house: userActionData.house,
                        mediaType: 'facades'
                    })
                }
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
            />;

        case UserAction.SHOW_INCLUSIONS_DIALOG:
            return <StandardInclusionsDialog
                onCancel={() => setUserAction(null)}
                userActionData={userActionData}
                getHouses={getHouses}
            />;
        case UserAction.SHOW_LOTMIX_PROFILE_DIALOG:
            return <LotmixProfileDialog
                onCancel={() => setUserAction(null)}
                company={company}
            />;
    }
    return null;
};

DialogList.propTypes = {
    userAction: PropTypes.symbol,
    userActionData: PropTypes.oneOfType([
        PropTypes.object
    ]),
    company: PropTypes.object,
    setUserAction: PropTypes.func.isRequired,
    removeHandler: PropTypes.func.isRequired,
    getHouses: PropTypes.func.isRequired,
};

export default DialogList;