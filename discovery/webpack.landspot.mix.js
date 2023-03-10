const mix = require('laravel-mix');
const path = require('path');
const fs = require('fs');

(() => {
    const fontDownloader = require('goog-webfont-dl');
    const fontCssFile = path.join(__dirname, 'resources/assets/fonts/roboto.css');
    fontDownloader({
        font: 'Roboto',
        formats: fontDownloader.formats, // Font formats.
        destination: path.join(__dirname, 'public/fonts/roboto'),               // Save font here
        out: null, // CSS file. Use '-' for stdout, and nothing to return the CSS code
        prefix: `~${process.env.APP_URL}/fonts/roboto`, // Prefix to use in CSS output
        subset: null, // = none     // Subset string/array, e.g. 'latin,cyrillic'
        styles: '400,400i,700,700i',  // Style string/array, e.g. '300,400,300italic,400italic'
    }).then(result => {
        result = result.replace(/http:\//g, 'http://');
        result = result.replace(/https:\//g, 'https://');
        if (fs.existsSync(fontCssFile)) {
            fs.unlinkSync(fontCssFile);
        }
        fs.writeFileSync(fontCssFile, result, {encoding: 'utf8', mode: 0o644, flag: 'w'});
    });
})();

const buildCssPath = 'public/css';
const buildImagesPath = 'public/images';
const phantomSourcePath = path.join(__dirname, 'node_modules/phantomjs2/lib/phantom/bin');
const publicJS = 'public/js';
const phantomDestPath = path.join(__dirname, 'public/js/vendor');
const phantomFilename = '/phantomjs';
const phantomDestFile = phantomDestPath + phantomFilename;
const publicInsightsCssPath = 'public/insights/css';
const publicInsightsJsPath = 'public/insights/js';

fs.lstat(phantomDestFile, (e, stats) => {
    if (!fs.existsSync(publicJS)) {
        fs.mkdirSync(publicJS);
    }

    if (!fs.existsSync(phantomDestPath)) {
        fs.mkdirSync(phantomDestPath);
    }

    if (stats && !stats.isSymbolicLink()) {
        fs.unlinkSync();
        fs.symlinkSync(phantomSourcePath + phantomFilename, phantomDestFile);
        return;
    }

    if (e && e.code === 'ENOENT') {
        fs.symlinkSync(phantomSourcePath + phantomFilename, phantomDestFile);
    }
});


mix.webpackConfig({
    resolve: {
        alias: {
            'pdfjs': path.join(__dirname, 'src'),
            'pdfjs-web': path.join(__dirname, 'resources/assets/third-party/pdf.js/web'),
            'pdfjs-lib': path.join(__dirname, 'resources/assets/third-party/pdf.js/web/pdfjs'),
            '~': path.resolve('resources/assets/js'),
            'images': path.resolve('resources/assets/img'),
            '~blog~': path.resolve('./packages/landconnect/blog/resources/assets/js')
        },
    }
});

const sassVars = {data: '$APP_URL: \'' + process.env.APP_URL + '\';\n'};

mix.react('packages/landconnect/blog/resources/assets/js/blog.js', publicInsightsJsPath)
    .react('resources/assets/js/lotmix.js', publicJS)
    .react('resources/assets/js/lotmix-amenities.js', publicJS)
    .react('resources/assets/js/lotmix-faq.js', publicJS)
    .react('resources/assets/js/estate-autocomplete.js', publicJS)
    .react('resources/assets/js/lotmix-estates.js', publicJS)
    .react('resources/assets/js/lotmix-sunpather.js', publicJS)
    .react('resources/assets/js/enquire-once/index.js', publicJS + '/enquire-once.js')
    .react('resources/assets/js/app.js', publicJS)
    .react('resources/assets/js/lotmix/estate-options.js', publicJS)
    .js('resources/assets/js/shim.js', publicJS)
    .js('resources/assets/js/simple-slider.js', publicJS)
    .sass('resources/assets/sass/landspot-login.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix-insights.scss', buildCssPath)
    .sass('resources/assets/sass/bootstrap-alert.scss', buildCssPath)
    .sass('resources/assets/sass/landspot-homepage.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix-enquire-once.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix-homepage.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix/public-estate.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix/estate-options.scss', buildCssPath)
    .sass('resources/assets/sass/lotmix-tos.scss', buildCssPath)
    .sass('resources/assets/sass/pdf-stage-lots.scss', buildCssPath)
    .sass('resources/assets/sass/pdf-viewer.scss', buildCssPath)
    .sass('resources/assets/sass/sso.scss', buildCssPath)

    .sass('node_modules/font-awesome/scss/font-awesome.scss', buildCssPath)

    .sass('resources/assets/sass/landspot/landspot-main.scss', buildCssPath)
    .sass('resources/assets/fonts/css/pdf-export-lot-fonts-inline.scss', buildCssPath, sassVars)
    .sass('resources/assets/fonts/css/pdf-export-floorplan-fonts-inline.scss', buildCssPath, sassVars)
    //for copying fonts to public fonder
    .sass('resources/assets/fonts/css/pdf-template-fonts.scss', buildCssPath)
    .sass('packages/landconnect/blog/resources/assets/css/blog.scss', publicInsightsCssPath)
    .sass('packages/landconnect/blog/resources/assets/css/blog-admin.scss', publicInsightsCssPath)
    .sass('packages/landconnect/blog/resources/assets/css/blog-login.scss', publicInsightsCssPath)

    .js('packages/landconnect/blog/resources/assets/js/blog-admin', publicInsightsJsPath)
    .js('packages/landconnect/blog/resources/assets/js/blog-app', publicInsightsJsPath)
    .copy(
        [
            'resources/assets/third-party/pdfjs/build/pdf.js',
            'resources/assets/third-party/pdfjs/build/pdf.worker.js',
            'resources/assets/third-party/pdf-worker/pdf.worker.2.6.347.js',
            'resources/assets/js/pdf-viewer.js',
            'resources/assets/js/print-pdf/rasterize.js',
            'resources/assets/js/print-pdf/pdf-options.js',
        ],
        publicJS
    )
    .copy(
        [
            'resources/assets/img/landspot-logo.png',
            'resources/assets/img/Lmix_logo.svg',
            'resources/assets/img/Lmix_logo.png',
            'resources/assets/img/landconnect-logo.png',
            'resources/assets/img/LC_Logo_Landspot_Icon-Blue.svg',
            'resources/assets/img/about.png',
            'resources/assets/img/shortlist-no-content-mobile.png',
            'resources/assets/img/shortlist-no-content-desktop.png',
            'resources/assets/img/grid-rect.svg',
            'resources/assets/img/sitings-logo.png',
            'resources/assets/img/company-images-pdf/orbit-barklay_entry_talent.jpg',
        ],
        buildImagesPath
    )
    .copy('resources/assets/img/lotmix', buildImagesPath + '/lotmix', false)
    .copy('resources/assets/video', 'public/video', false)
    .copy('resources/assets/img/company-images-pdf/pdf_public', buildImagesPath + '/pdf_public')
    .copy(
        'node_modules/summernote/dist/summernote-bs4.css',
        'public/insights/vendor/summernote'
    )
    .copy(
        'node_modules/summernote/dist/font',
        'public/insights/vendor/summernote/font'
    )
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

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

mix.webpackConfig({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: {
                    test: path.resolve(__dirname, 'node_modules'),
                    exclude: [
                        path.resolve(__dirname, 'node_modules/axios'),
                        path.resolve(__dirname, 'node_modules/query-string'),
                        path.resolve(__dirname, 'node_modules/strict-uri-encode'),
                        path.resolve(__dirname, 'node_modules/decode-uri-component'),
                        path.resolve(__dirname, 'node_modules/redux-logger'),
                        path.resolve(__dirname, 'node_modules/glamorous'),
                        path.resolve(__dirname, 'node_modules/glamor'),
                    ]
                },
                loader: 'babel-loader'
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
        ],
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ]
});

(() => {
    const pdfSassFiles = fs.readdirSync('resources/assets/sass/pdf-brochure/');
    for (let i = 0, file; (file = pdfSassFiles[i++]);) {
        if (/^[^_]+\.scss$/.test(file)) {
            mix.sass(`resources/assets/sass/pdf-brochure/${file}`, buildCssPath + '/pdf-brochure', sassVars);
        }
    }
})();

//access to source files from browser on server && dev servers
if (process.env.APP_ENV !== 'prod' && process.env.APP_ENV !== 'production') {
    mix.webpackConfig({
        devtool: 'inline-source-map'
    });
}