import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/progress-bar', {
	title: __( 'GE Progress Bar', 'gameengine' ),
	description: __( 'Show a visual progress bar toward the next level or an achievement.', 'gameengine' ),
	category: 'gameengine',
	icon: 'minus',
	attributes: {
		point_type:    { type: 'string', default: '' },
		mode:          { type: 'string', default: 'level' },
		achievement_id:{ type: 'string', default: '' },
		color:         { type: 'string', default: '#4f46e5' },
		height:        { type: 'number', default: 12 },
	},
	edit( { attributes, setAttributes } ) {
		const { point_type, mode, achievement_id, color, height } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Progress Bar Settings', 'gameengine' ) }>
						<TextControl
							label={ __( 'Point Type ID', 'gameengine' ) }
							help={ __( 'Leave empty for the default point type.', 'gameengine' ) }
							value={ point_type }
							onChange={ ( val ) => setAttributes( { point_type: val } ) }
						/>
						<SelectControl
							label={ __( 'Mode', 'gameengine' ) }
							value={ mode }
							options={ [
								{ label: __( 'Level progress', 'gameengine' ),      value: 'level' },
								{ label: __( 'Achievement progress', 'gameengine' ), value: 'achievement' },
							] }
							onChange={ ( val ) => setAttributes( { mode: val } ) }
						/>
						{ mode === 'achievement' && (
							<TextControl
								label={ __( 'Achievement ID', 'gameengine' ) }
								value={ achievement_id }
								onChange={ ( val ) => setAttributes( { achievement_id: val } ) }
							/>
						) }
						<TextControl
							label={ __( 'Bar colour (hex)', 'gameengine' ) }
							value={ color }
							onChange={ ( val ) => setAttributes( { color: val } ) }
						/>
						<RangeControl
							label={ __( 'Bar height (px)', 'gameengine' ) }
							value={ height }
							onChange={ ( val ) => setAttributes( { height: val } ) }
							min={ 4 }
							max={ 40 }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/progress-bar" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
