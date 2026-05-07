import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/points-balance', {
	title: __( 'GE Points Balance', 'gameengine' ),
	description: __( "Display the current user's point balance.", 'gameengine' ),
	category: 'gameengine',
	icon: 'star-filled',
	attributes: {
		point_type:    { type: 'string',  default: '' },
		show_icon:     { type: 'boolean', default: true },
		guest_message: { type: 'string',  default: '' },
	},
	edit( { attributes, setAttributes } ) {
		const { point_type, show_icon, guest_message } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Points Balance Settings', 'gameengine' ) }>
						<TextControl
							label={ __( 'Point Type ID', 'gameengine' ) }
							help={ __( 'Leave empty for the default point type.', 'gameengine' ) }
							value={ point_type }
							onChange={ ( val ) => setAttributes( { point_type: val } ) }
						/>
						<ToggleControl
							label={ __( 'Show icon', 'gameengine' ) }
							checked={ show_icon }
							onChange={ ( val ) => setAttributes( { show_icon: val } ) }
						/>
						<TextControl
							label={ __( 'Guest message', 'gameengine' ) }
							help={ __( 'Shown to logged-out visitors. Leave empty to hide.', 'gameengine' ) }
							value={ guest_message }
							onChange={ ( val ) => setAttributes( { guest_message: val } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/points-balance" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
