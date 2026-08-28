const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const GAMEENGINE_VERSION = '1.3.1';

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
            '@GFHooks': path.resolve(__dirname, 'dev_gameengine/hooks/'),
            '@GFUtils': path.resolve(__dirname, 'dev_gameengine/utils/'),
        },
    },
    module: {
		...defaultConfig.module,
		rules: [
			// 1. Clone existing rules from WP Scripts, but exclude react-datepicker
			...defaultConfig.module.rules.map(rule => {
				if (rule.test && rule.test.toString().includes('css')) {
					return {
						...rule,
						exclude: /node_modules\/react-datepicker/,
					};
				}
				return rule;
			}),

			// 2. Add a dedicated loader for react-datepicker.css
			{
				test: /react-datepicker\.css$/,
				use: ['style-loader', 'css-loader'],
			}
		]
	},
};