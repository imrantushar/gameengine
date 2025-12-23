/* eslint jsx-a11y/label-has-associated-control: 0 */
import React from 'react';

import './switchfield.scss';

const CustomSwitch = ( { value, disabled, ...props } ) => {
	const isChecked = typeof value === 'boolean' ? value : false;

	return (
		<div className="gamify-ccb-switch">
			<label className="gamify-ccb-switcher">
				<input
					type="checkbox"
					className="form-control"
					{ ...props }
					checked={ disabled ? false : isChecked }
					defaultChecked={ disabled ? false : value }
					disabled={ disabled }
				/>
				<span className="gamify-ccb-slider"></span>
			</label>
			<span className="gamify-ccb-title"></span>
		</div>
	);
};

export default CustomSwitch;
