import * as companyActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';
import {EnquireDialogStep} from '../../constants';

const enquireState = {
    companyId: '',
    estateId: '',
    formData: {
        firstName: '',
        lastName: '',
        email: '',
        buyerTypeId: '',
        regionId: '',
        phone: '',
        phoneShort: '',
        code: ''
    },
    step: EnquireDialogStep.EMAIL,
    verified: false,
    codeSent: false,
    emailAlert: '',
};

const initialState = Object.freeze({
    loading: false,
    errors: [],
    enquireState
});

export default (state = initialState, action) => {
    switch (action.type) {
        case companyActions.SEND_COMPANY_ENQUIRE_FORM :
        case companyActions.SEND_ESTATE_ENQUIRE_FORM :
        case companyActions.SEND_SMS_VERIFICATION :
        case companyActions.VERIFY_SMS_CODE :
            return {
                ...state,
                loading: true
            };
        case companyActions.SET_ENQUIRE_STATE :
        case success(companyActions.SEND_SMS_VERIFICATION) :
        case success(companyActions.VERIFY_SMS_CODE) :
        case success(companyActions.SEND_ESTATE_ENQUIRE_FORM) :
        case success(companyActions.SEND_COMPANY_ENQUIRE_FORM) :
            return {
                ...state,
                loading: false,
                enquireState: {...state.enquireState, ...action.payload.data}
            };
        case error(companyActions.SEND_COMPANY_ENQUIRE_FORM) :
        case error(companyActions.SEND_ESTATE_ENQUIRE_FORM) :
        case error(companyActions.SEND_SMS_VERIFICATION) :
        case error(companyActions.VERIFY_SMS_CODE) :
            return {
                ...state,
                errors: errorExtractor(action),
                loading: false
            };
        case companyActions.RESET_DIALOG_STORE :
            return initialState;
        case companyActions.RESET_POPUP_MESSAGES :
            return {
                ...state,
                errors: []
            };
        default:
            return state;
    }
};