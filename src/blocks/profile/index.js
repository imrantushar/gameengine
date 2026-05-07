import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/profile', {
	title: __( 'GE Profile', 'gameengine' ),
	description: __( "Display the current user's gamification profile card.", 'gameengine' ),
	category: 'gameengine',
	icon: 'id',
	attributes: {
		show_points:       { type: 'boolean', default: true },
		show_achievements: { type: 'boolean', default: true },
		show_level:        { type: 'boolean', default: true },
	},
	edit( { attributes, setAttributes } ) {
		const { show_points, show_achievements, show_level } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Profile Settings', 'gameengine' ) }>
						<ToggleControl
							label={ __( 'Show points balance', 'gameengine' ) }
							checked={ show_points }
							onChange={ ( val ) => setAttributes( { show_points: val } ) }
						/>
						<ToggleControl
							label={ __( 'Show achievements', 'gameengine' ) }
							checked={ show_achievements }
							onChange={ ( val ) => setAttributes( { show_achievements: val } ) }
						/>
						<ToggleControl
							label={ __( 'Show current level', 'gameengine' ) }
							checked={ show_level }
							onChange={ ( val ) => setAttributes( { show_level: val } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/profile" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
