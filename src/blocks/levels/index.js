import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/levels', {
	title: __( 'GE Levels', 'gameengine' ),
	description: __( "Display the current user's level progress.", 'gameengine' ),
	category: 'gameengine',
	icon: 'chart-bar',
	attributes: {
		show_list:     { type: 'boolean', default: false },
		point_type_id: { type: 'string',  default: '' },
	},
	edit( { attributes, setAttributes } ) {
		const { show_list, point_type_id } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Levels Settings', 'gameengine' ) }>
						<TextControl
							label={ __( 'Point Type ID', 'gameengine' ) }
							help={ __( 'Leave empty for the default point type.', 'gameengine' ) }
							value={ point_type_id }
							onChange={ ( val ) => setAttributes( { point_type_id: val } ) }
						/>
						<ToggleControl
							label={ __( 'Show all levels list', 'gameengine' ) }
							checked={ show_list }
							onChange={ ( val ) => setAttributes( { show_list: val } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/levels" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
