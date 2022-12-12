const defaultState = Object.freeze({
    unreadMessagesCount: null,
    changeMinimisedState: null,
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_CHAT_UNREAD_MESSAGES_COUNT': {
            return {...state, ...action.payload};
        }

        case 'SET_MINIMIZED_STATE': {
            return {...state, ...{changeMinimisedState: true}};
        }

        case 'RESET_MINIMIZED_STATE': {
            return {...state, ...{changeMinimisedState: null}};
        }
    }
    return state;
};