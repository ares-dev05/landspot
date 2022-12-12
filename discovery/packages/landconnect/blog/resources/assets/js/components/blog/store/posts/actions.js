import {APIAction} from '~blog~/axios/api';

export const GET_POSTS = 'GET_POSTS';
export const GET_POST = 'GET_POST';
export const RESET_POSTS_STORE = 'RESET_POSTS_STORE';
export const RESET_POST_STORE = 'RESET_POST_STORE';

export const getPosts = (params) => {
    const url = '/insights/api/post';
    return APIAction(GET_POSTS, 'get', url, null, null, params);
};

export const getPost = (urlParams) => {
    const url = '/insights/api/post/:slug';
    return APIAction(GET_POST, 'get', url, null, urlParams);
};

export const resetPostsStore = () => {
    return {type: RESET_POSTS_STORE};
};

export const resetPostStore = () => {
    return {type: RESET_POST_STORE};
};