import {APIAction} from '~/axios/api';

export const GET_ESTATES = 'GET_ESTATES';
export const getEstates = query => {
    const url = '/kaspa-engine/estates';
    return APIAction(GET_ESTATES, 'get', url, null, null, query);
};

export const GET_FORMULAS = 'GET_FORMULAS';
export const getFormulas = query => {
    const url = '/kaspa-engine/formulas';
    return APIAction(GET_FORMULAS, 'get', url, null, null, query);
};

export const GET_LAST_SELECTED_FORMULAS = 'GET_LAST_SELECTED_FORMULAS';
export const getLastFormulas = url => {
    return APIAction(GET_LAST_SELECTED_FORMULAS, 'get', url);
};

export const RESET_KASPA_ENGINE_MESSAGES = 'RESET_KASPA_ENGINE_MESSAGES';
export const resetKaspaEngineMessages = () => {
    return {type: RESET_KASPA_ENGINE_MESSAGES};
};

export const ADD_NEW_RULES_TO_ENTITY = 'ADD_NEW_RULES_TO_ENTITY';
export const addNewRules = (data, url) => {
    return APIAction(ADD_NEW_RULES_TO_ENTITY, 'put', url, data);
};

export const REMOVE_RULE_FROM_ENTITY = 'REMOVE_RULE_FROM_ENTITY';
export const removeRule = (data, url) => {
    return APIAction(REMOVE_RULE_FROM_ENTITY, 'delete', url, data);
};

export const UPDATE_STAGE_PACKAGE = 'UPDATE_STAGE_PACKAGE';
export const updatePackage = (data, status) => ({
    type: status ? status(UPDATE_STAGE_PACKAGE) : UPDATE_STAGE_PACKAGE,
    payload: data
});

export const DELETE_STAGE_PACKAGE = 'DELETE_STAGE_PACKAGE';
export const deletePackage = (data, url) => {
    return APIAction(DELETE_STAGE_PACKAGE, 'delete', '/kaspa-engine/destroy-pdf', data, url);
};

export const RESET_USER_MESSAGES = 'RESET_USER_MESSAGES';
export const resetMessages = () => {
    return {type: RESET_USER_MESSAGES};
};