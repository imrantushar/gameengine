import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/achievements', {
	title: __( 'GE Achievements', 'gameengine' ),
	description: __( "Show the current user's earned (and optionally locked) achievements.", 'gameengine' ),
	category: 'gameengine',
	icon: 'medals',
	attributes: {
		show_locked: { type: 'boolean', default: false },
	},
	edit( { attributes, setAttributes } ) {
		const { show_locked } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Achievements Settings', 'gameengine' ) }>
						<ToggleControl
							label={ __( 'Show locked achievements', 'gameengine' ) }
							checked={ show_locked }
							onChange={ ( val ) => setAttributes( { show_locked: val } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/achievements" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
