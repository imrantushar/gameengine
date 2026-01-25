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
		<div className={ `gameengine-oops gameengine-oops__message` }>
			<div className="gameengine-oops__icon">
				<img src={ imageSrc } alt="" onLoad={ handleImageLoad } />
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
