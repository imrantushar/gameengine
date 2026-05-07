import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-rendering';

registerBlockType( 'gameengine/point-history', {
	title: __( 'GE Point History', 'gameengine' ),
	description: __( "Display the current user's point transaction history with load-more pagination.", 'gameengine' ),
	category: 'gameengine',
	icon: 'list-view',
	attributes: {
		per_page: { type: 'number', default: 10 },
	},
	edit( { attributes, setAttributes } ) {
		const { per_page } = attributes;
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Point History Settings', 'gameengine' ) }>
						<RangeControl
							label={ __( 'Transactions per page', 'gameengine' ) }
							value={ per_page }
							onChange={ ( val ) => setAttributes( { per_page: val } ) }
							min={ 5 }
							max={ 50 }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...useBlockProps() }>
					<ServerSideRender block="gameengine/point-history" attributes={ attributes } />
				</div>
			</>
		);
	},
	save: () => null,
} );
