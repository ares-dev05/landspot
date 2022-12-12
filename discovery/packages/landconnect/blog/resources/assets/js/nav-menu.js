(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var button = document.querySelector('button.navbar-toggler');
        if (!button) {
            return;
        }
        button.addEventListener('mousedown', function (event) {
            var menu = document.querySelector('div.navbar-collapse');
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
            } else {
                menu.classList.add('show');
            }
            event.stopPropagation();
        });
    }, {once: true});
})();