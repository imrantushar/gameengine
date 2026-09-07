const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const webpack = require('webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV !== 'development';

/**
 * The uncompiled source each generated file is built from.
 *
 * Every entry point below is `src/<name>.js`, and each of those imports
 * `assets/scss/<name>.scss`, so the generated `assets/build/<name>.js` and
 * `assets/build/<name>.css` map back onto their sources by name alone.
 */
const sourceOf = (filename, chunkName) =>
    filename.endsWith('.css')
        ? `assets/scss/${chunkName}.scss (plus the Tailwind classes used in src/)`
        : `src/${chunkName}.js`;

/**
 * Header written to the top of every generated file.
 *
 * Minification strips ordinary comments, so this is added after the minifier
 * has run. It is here so that anyone opening a file in assets/build/ is told,
 * in that file, where its readable source is and how to rebuild it.
 */
const sourceHeader = new webpack.BannerPlugin({
    banner: ({ filename, chunk }) =>
        [
            'GameEngine - generated file, do not edit.',
            '',
            `Built from ${sourceOf(filename, chunk.name)}.`,
            'The complete uncompiled source ships with this plugin in src/ and',
            'assets/scss/, and is also at https://github.com/imrantushar/gameengine',
            '',
            'To rebuild this file, run the following in the plugin directory:',
            '  npm install',
            '  npm run build',
            '',
            'License: GPL-2.0-or-later',
        ].join('\n'),
    // .asset.php must not be touched: a comment before its <?php tag would be
    // printed to the page.
    test: /\.(js|css)$/,
    entryOnly: true,
    // BannerPlugin runs before the minifier by default, which then removes the
    // comment again. PROCESS_ASSETS_STAGE_ANALYSE is after minification.
    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
});

module.exports = {
    ...defaultConfig,
    entry: {
        backend: path.resolve(__dirname, 'src/backend.js'),
        frontend: path.resolve(__dirname, 'src/frontend.js'),
        setup: path.resolve(__dirname, 'src/setup.js')
    },
    // Each entry in `entry` above writes assets/build/<name>.js, so every
    // generated file is named after the source file it is built from. Cache
    // busting is the content hash in the generated .asset.php, which is what
    // the plugin passes to wp_enqueue_script().
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'assets/build'),
    },
    plugins: [
        ...defaultConfig.plugins,
        // Development builds are left alone so the source maps line up with
        // the generated file exactly.
        ...(isProduction ? [sourceHeader] : []),
    ],
    resolve: {
        alias: {
            ...defaultConfig.resolve.alias,
            '@GFComponents': path.resolve(__dirname, 'src/components/'),
            '@GFContainers': path.resolve(__dirname, 'src/containers/'),
            // '@GFPages': path.resolve( __dirname, 'src/containers/pages/' ),
            '@GFCustomizer': path.resolve(__dirname, 'src/customizer/'),
            '@GFGlobal': path.resolve(__dirname, 'src/global/'),
            '@GFRedux': path.resolve(__dirname, 'src/redux/'),
            '@GFHooks': path.resolve(__dirname, 'src/hooks/'),
            '@GFUtils': path.resolve(__dirname, 'src/utils/'),
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
