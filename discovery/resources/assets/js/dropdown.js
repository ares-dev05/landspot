import store from '~/helpers/store';

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        document.body.addEventListener('mousedown', function (event) {
            const state = store.getState();
            const {activeDropdown} = state.dropdown;

            if (activeDropdown && !activeDropdown.parentNode.contains(event.target)) {
                store.dispatch({type: 'RESET_ACTIVE_DROPDOWN'});
            }
        });
    })
})();