const mix = require('laravel-mix');
const path = require('path');

const publicSitingsCssPath = 'public/sitings/assets/css';
const publicSitingsJsPath = 'public/sitings/assets/js';

mix.webpackConfig({
    resolve: {
        alias: {
            '~sitings~': path.resolve('resources/assets/js/sitings'),
            '~': path.resolve('resources/assets/js')
        },
    }
});

mix.react('resources/assets/js/sitings/app.js', publicSitingsJsPath)
    .sass('resources/assets/sass/sitings/app.scss', publicSitingsCssPath)
    .copy(
        [
            'resources/assets/third-party',
        ],
        'public/sitings/assets/third-party'
    )
    .copy(
        [
            'resources/assets/textures',
        ],
        'public/sitings/assets/textures'
    )
    .setPublicPath('public/sitings/assets')
    .setResourceRoot('/sitings/assets')
    .version()
    .extract([
        'assert',
        'autosize',
        'axios',
        'classnames',
        'fingerprintjs2',
        'jquery',
        'lodash',
        'material-colors',
        'moment',
        'pluralize',
        'prop-types',
        'pubnub',
        'pusher-js',
        'query-string',
        'react',
        'react-alert',
        'react-autosize-textarea',
        'react-dom',
        'react-js-pagination',
        'react-quill',
        'react-redux',
        'react-router-dom',
        'react-router-redux',
        'reactcss',
        'redux-logger',
        'redux-saga',
        'regenerator-runtime',
        'summernote',
        'tinycolor2',
        'util',
    ]);

mix.webpackConfig({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: {
                    test   : path.resolve(__dirname, "node_modules"),
                    exclude: [
                        path.resolve(__dirname, "node_modules/axios"),
                        path.resolve(__dirname, "node_modules/query-string"),
                        path.resolve(__dirname, "node_modules/strict-uri-encode"),
                        path.resolve(__dirname, "node_modules/decode-uri-component"),
                        path.resolve(__dirname, "node_modules/redux-logger"),
                        path.resolve(__dirname, "node_modules/glamorous"),
                        path.resolve(__dirname, "node_modules/glamor"),
                        path.resolve(__dirname, "resources/assets/js/sitings/sitings-sdk")
                    ]
                },
                loader: "babel-loader"
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve('file-loader'),
                        test: [
                            /\.glb$/,
                        ],
                        options: {
                            name: '[name].[ext]',
                            publicPath: '/static/media',
                            outputPath: '/static/media'
                        },
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
                loader: require.resolve('file-loader'),
                test: /\.xml$/,
                options: {
                    name: '[name].[ext]',
                    publicPath: '/sitings/assets/images',
                    outputPath: 'images'
                },
            },
        ],
    },
    plugins: []
});

//access to source files from browser on server && dev servers
if(process.env.APP_ENV !== 'prod' && process.env.APP_ENV !== 'production'){
    mix.webpackConfig({
       devtool: 'inline-source-map'
    });
}
