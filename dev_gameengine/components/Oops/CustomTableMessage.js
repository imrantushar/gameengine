import React, { useState } from 'react';
import { plugin_root_url } from '@GFUtils/helper';
import { useThemeMode } from '@GFUtils/theme';

import './styles.scss';

const CustomTableMessage = ( { title, subText, button } ) => {
	const [ isImageLoaded, setIsImageLoaded ] = useState( false );
	const { isDark } = useThemeMode();

	const handleImageLoad = () => {
		setIsImageLoaded( true );
	};

	// The empty-state artwork is a flat file, so it cannot read the theme
	// tokens — ship the palette twice and pick per mode.
	const imageSrc =
		plugin_root_url +
		'assets/images/' +
		( isDark ? 'NoDataAvailable-dark.svg' : 'NoDataAvailable.svg' );

	return (
		<div className={ `gameengine-oops gameengine-oops__message` }>
			<div className="gameengine-oops__icon">
				<img key={ imageSrc } src={ imageSrc } alt="" onLoad={ handleImageLoad } />
			</div>

			{ isImageLoaded && (
				<div className="gameengine-oops__content">
					<h3 className="gameengine-oops__heading">{ title }</h3>
					<h3 className="gameengine-oops__text">{ subText }</h3>
					<div className="gameengine-oops__button">{ button }</div>
				</div>
			) }
		</div>
	);
};

export default CustomTableMessage;
