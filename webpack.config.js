const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const GAMEENGINE_VERSION = '1.0.0';

module.exports = {
    ...defaultConfig,
    entry: {
        backend: path.resolve(__dirname, 'dev_gameengine/backend.js'),
        frontend: path.resolve(__dirname, 'dev_gameengine/frontend.js'),
        setup: path.resolve(__dirname, 'dev_gameengine/setup.js')
    },
    output: {
        filename: `[name].${GAMEENGINE_VERSION}.js`,
        path: path.resolve(__dirname, 'assets/build'),
    },
    resolve: {
        alias: {
            ...defaultConfig.resolve.alias,
            '@GFComponents': path.resolve(__dirname, 'dev_gameengine/components/'),
            '@GFContainers': path.resolve(__dirname, 'dev_gameengine/containers/'),
            // '@GFPages': path.resolve( __dirname, 'dev_gameengine/containers/pages/' ),
            '@GFCustomizer': path.resolve(__dirname, 'dev_gameengine/customizer/'),
            '@GFGlobal': path.resolve(__dirname, 'dev_gameengine/global/'),
            '@GFRedux': path.resolve(__dirname, 'dev_gameengine/redux/'),
            '@GFUtils': path.resolve(__dirname, 'dev_gameengine/utils/'),
        },
    },
};