import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const propTypes = {
	type: PropTypes.string,
};

export default function Tooltip( { children, type = 'info' } ) {
	return (
		<React.Fragment>
			<div className="quizepress-tooltip">
				{ type === 'info' && (
					<span className="quizepress-icon gamify-icon--info"></span>
				) }
				{ type === 'pro' && (
					<span className="quizepress-icon quizepress-icon--lock-light"></span>
				) }
				<span className="quizepress-tooltip__text">{ children }</span>
			</div>
		</React.Fragment>
	);
}

Tooltip.propTypes = propTypes;
