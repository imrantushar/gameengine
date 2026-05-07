import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/progress-map', {
	title: __( 'GE Progress Map', 'gameengine' ),
	description: __( 'Display a visual progress map of all levels for the current user.', 'gameengine' ),
	category: 'gameengine',
	icon: 'location',
	attributes: {},
	edit() {
		return (
			<div { ...useBlockProps() }>
				<ServerSideRender block="gameengine/progress-map" attributes={ {} } />
			</div>
		);
	},
	save: () => null,
} );
