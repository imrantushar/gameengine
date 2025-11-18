const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const GAMIFY_VERSION = '1.0.0';

module.exports = {
    ...defaultConfig,
    entry: {
        backend: path.resolve(__dirname, 'dev_gamify/backend.js'),
    },
    output: {
        filename: `[name].${GAMIFY_VERSION}.js`,
        path: path.resolve(__dirname, 'assets/build'),
    },
    resolve: {
        alias: {
            ...defaultConfig.resolve.alias,
            '@Components': path.resolve(__dirname, 'dev_gamify/components/'),
            '@Utils': path.resolve(__dirname, 'dev_gamify/utils/'),
			'@Pages': path.resolve( __dirname, 'src/containers/pages/' ),
        },
    },
};