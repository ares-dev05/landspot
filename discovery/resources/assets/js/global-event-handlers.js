import axios from 'axios';

(function () {
    const previousOnError = window.onerror;
    window.onerror = function (message, source, line, column, error) {
        if (message.indexOf("'Promise' is undefined") >= 0 || source === 'about:blank' || !source) {
            return;
        }
        const {location: {href, search}, navigator: {userAgent}} = window;

        axios.post('/error-handler', {
            exception: {message, source, line, column, error, url: href + search, userAgent}
        }, {
            headers: {
                post: {'X-Requested-With': 'XMLHttpRequest'}
            }
        });

        if (process.env.NODE_ENV !== 'production') {
            console.error(arguments);
        }

        if (previousOnError) {
            try {
                previousOnError.apply(null, arguments);
            } catch (e) {

            }
        }
        return true;
    };
})();