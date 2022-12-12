import {put} from 'redux-saga/effects';
import {APIAction} from '~/axios/api';

export const NEW_COMPANIES_CATALOGUE = 'NEW_COMPANIES_CATALOGUE';
export const FILTER_COMPANIES_CATALOGUE = 'FILTER_COMPANIES_CATALOGUE';
export const GET_USER = 'GET_USER';
export const ADD_COMPANY = 'ADD_COMPANY';
export const UPDATE_COMPANY = 'UPDATE_COMPANY';

export const newCompaniesCatalogue = () => {
  const url = '/landspot/user-manager/filter';
  return APIAction(NEW_COMPANIES_CATALOGUE, 'get', url);
};

export const filterCompaniesCatalogue = (query) => {
  const url = '/landspot/user-manager/filter';
  return APIAction(FILTER_COMPANIES_CATALOGUE, 'get', url, null, null, query);
};

export const getUser = () => {
  const url = '/landspot/user-manager/user';
  return APIAction(GET_USER, 'get', url);
};

export const addCompany = (data) => {
    const url = '/landspot/company';
    let action = APIAction(ADD_COMPANY, 'post', url, data);
    action.onSuccess = function* () {
        yield put(newCompaniesCatalogue());
    };
    return action;
};

export const updateCompany = (data, urlParams) => {
    const url = '/landspot/company/:id';
    let action = APIAction(UPDATE_COMPANY, 'put', url, data, urlParams);
    action.onSuccess = function* () {
        yield put(newCompaniesCatalogue());
    };
    return action;
};