export default (state = {
    activeDropdown: null
}, action) => {
    switch (action.type) {
        case 'RESET_ACTIVE_DROPDOWN':
            return {
                activeDropdown: null
            };

        case 'SET_ACTIVE_DROPDOWN':
            return Object.assign({}, state, action.payload);

        default:
            return state;
    }
};