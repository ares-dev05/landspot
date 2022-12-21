import {put} from 'redux-saga/effects';
import {APIAction} from '~/axios/api';
import {getUsers} from '../estate/actions';

export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const SAVE_PERMISSIONS = 'SAVE_PERMISSIONS';

export const savePermissions = (data, params) => {
    let apiAction = APIAction(SAVE_PERMISSIONS, 'post', '/landspot/pdf-manager/users', data);

    apiAction.onSuccess = function* (data) {
        const {companyId: id} = data;
        yield put(getUsers({id}, {filterUsers: 1}));
    };

    return apiAction;
};

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};
