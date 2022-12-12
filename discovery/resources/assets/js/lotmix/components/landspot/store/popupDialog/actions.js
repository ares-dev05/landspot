import {APIAction} from '~/axios/api';

export const LOAD_LOT_VISIBILITY = 'LOAD_LOT_VISIBILITY';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const LOAD_ESTATE_DOCUMENTS = 'LOAD_ESTATE_DOCUMENTS';
export const RESET_DIALOG_MESSAGES = 'RESET_DIALOG_MESSAGES';

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};

export const resetDialogMessages = () => {
    return {type: RESET_DIALOG_MESSAGES};
};