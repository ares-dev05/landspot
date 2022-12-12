import axios from 'axios';
import {ApiRequest} from '~/axios/api';

const URL_PREFIX = '/enquire';


export const getBuilders = () => axios.get(URL_PREFIX + '/builders');

export const getRegions = () => axios.get(URL_PREFIX + '/regions');

export const getSuburbs = (urlParams) => ApiRequest('get', URL_PREFIX + '/suburbs/:regionId', null, urlParams);

export const getStates = () => axios.get(URL_PREFIX + '/states');

export const getBuyerTypes = data => axios.get(URL_PREFIX + '/buyer-types', data);

export const sendSMSVerification = data => axios.post(URL_PREFIX + '/sms-verification', data);

export const verifySMSCode = data => axios.post(URL_PREFIX + '/verify-sms-code', data);

export const sendCompaniesEnquireForm = data => axios.post(URL_PREFIX + '/message/companies', data);