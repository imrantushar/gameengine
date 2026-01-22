const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const GAMIFY_VERSION = '1.0.0';

module.exports = {
    ...defaultConfig,
    entry: {
        backend: path.resolve(__dirname, 'dev_gamify/backend.js'),
        frontend: path.resolve(__dirname, 'dev_gamify/frontend.js'),
    },
    output: {
        filename: `[name].${GAMIFY_VERSION}.js`,
        path: path.resolve(__dirname, 'assets/build'),
    },
    resolve: {
        alias: {
            ...defaultConfig.resolve.alias,
            '@GFComponents': path.resolve(__dirname, 'dev_gamify/components/'),
            '@GFContainers': path.resolve(__dirname, 'dev_gamify/containers/'),
            // '@GFPages': path.resolve( __dirname, 'dev_gamify/containers/pages/' ),
            '@GFCustomizer': path.resolve(__dirname, 'dev_gamify/customizer/'),
            '@GFGlobal': path.resolve(__dirname, 'dev_gamify/global/'),
            '@GFRedux': path.resolve(__dirname, 'dev_gamify/redux/'),
            '@GFUtils': path.resolve(__dirname, 'dev_gamify/utils/'),
        },
    },
};