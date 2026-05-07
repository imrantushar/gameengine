import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/leaderboard', {
	title: __( 'GE Leaderboard', 'gameengine' ),
	description: __( 'Display a top-earners leaderboard for a point type.', 'gameengine' ),
	category: 'gameengine',
	icon: 'awards',
	attributes: {
		count:      { type: 'number', default: 10 },
		point_type: { type: 'string', default: '' },
		time_range: { type: 'string', default: 'all_time' },
	},
	edit( { attributes, setAttributes } ) {
		const { count, point_type, time_range } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Leaderboard Settings', 'gameengine' ) }>
						<RangeControl
							label={ __( 'Number of users', 'gameengine' ) }
							value={ count }
							onChange={ ( val ) => setAttributes( { count: val } ) }
							min={ 1 }
							max={ 100 }
						/>
						<TextControl
							label={ __( 'Point Type ID', 'gameengine' ) }
							help={ __( 'Leave empty for the default point type.', 'gameengine' ) }
							value={ point_type }
							onChange={ ( val ) => setAttributes( { point_type: val } ) }
						/>
						<SelectControl
							label={ __( 'Time range', 'gameengine' ) }
							value={ time_range }
							options={ [
								{ label: __( 'All time', 'gameengine' ),   value: 'all_time' },
								{ label: __( 'Today', 'gameengine' ),      value: 'today' },
								{ label: __( 'This week', 'gameengine' ),  value: 'week' },
								{ label: __( 'This month', 'gameengine' ), value: 'month' },
							] }
							onChange={ ( val ) => setAttributes( { time_range: val } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/leaderboard" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
