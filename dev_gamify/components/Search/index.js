import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { reactDebounce } from '@GFUtils/helper';
import './styles.scss';

const propTypes = {
	placeholder: PropTypes.string,
	onSearchHandler: PropTypes.func,
	defaultValue: PropTypes.string,
};

export default function Search( {
	placeholder = 'Search...',
	defaultValue = '',
	onSearchHandler = () => {},
	custom = '',
} ) {
	const [ searchText, setSearchText ] = useState( defaultValue );

	const classNames = [ 'gamify-search-component', custom && `${ custom }` ]
		.filter( Boolean )
		.join( ' ' );

	const debouncedAPICall = useCallback(
		reactDebounce( ( keyword ) => {
			onSearchHandler( keyword );
		}, 1000 ),
		[ onSearchHandler ]
	);

	const searchHandler = ( searchValue ) => {
		setSearchText( searchValue );
		debouncedAPICall( searchValue );
	};

	const handleClear = () => {
		if ( searchText ) {
			setSearchText( '' );
			onSearchHandler( '' );
		}
	};

	return (
		<React.Fragment>
			<div className={ classNames }>
				<span className="gamify-search-component__search gamify-icon gamify-icon--search" />
				<input
					id="search"
					type="text"
					className="gamify-search-component__input gamify-input"
					placeholder={ placeholder }
					value={ searchText }
					onChange={ ( e ) => searchHandler( e.target.value ) }
				/>
				{ searchText && (
					<button
						onClick={ handleClear }
						className="gamify-search-component__control"
					>
						<span className="gamify-icon gamify-icon--close-small"></span>
					</button>
				) }
			</div>
		</React.Fragment>
	);
}

Search.propTypes = propTypes;
