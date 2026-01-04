import React, { useContext, useState } from 'react';
import { plugin_root_url } from '@GFUtils/helper';

import './styles.scss';

const CustomTableMessage = ( { title, subText, button } ) => {
	const [ isImageLoaded, setIsImageLoaded ] = useState( false );

	const handleImageLoad = () => {
		setIsImageLoaded( true );
	};

	const imageSrc = plugin_root_url + 'assets/images/' + 'NoDataAvailable.svg';

	return (
		<div className={ `gamify-oops gamify-oops__message` }>
			<div className="gamify-oops__icon">
				<img src={ imageSrc } alt="" onLoad={ handleImageLoad } />
			</div>

			{ isImageLoaded && (
				<div className="gamify-oops__content">
					<h3 className="gamify-oops__heading">{ title }</h3>
					<h3 className="gamify-oops__text">{ subText }</h3>
					<div className="gamify-oops__button">{ button }</div>
				</div>
			) }
		</div>
	);
};

export default CustomTableMessage;
