import React from 'react';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import UserAction from '../estate/consts';
import EditEstatesManagerPermissions from './EditEstatesManagerPermissions';
import PropTypes from 'prop-types';

const DialogList = ({
                        userAction, userActionData,
                        setUserAction,
                        removeHandler,
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
        case UserAction.ADD_USER:
            if (userActionData) {
                return <EditEstatesManagerPermissions onConfirm={removeHandler}
                                                      userActionData={userActionData}
                                                      onCancel={() => {
                                                          setUserAction(null);
                                                      }}
                />;
            }
            break;
    }
    return null;
};

DialogList.propTypes = {
    userAction: PropTypes.symbol,
    userActionData: PropTypes.oneOfType([
        PropTypes.object
    ]),
    setUserAction: PropTypes.func.isRequired,
    removeHandler: PropTypes.func.isRequired,
};

export default DialogList;