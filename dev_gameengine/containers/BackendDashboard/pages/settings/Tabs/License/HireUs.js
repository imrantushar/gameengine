import React from 'react';
import { __ } from '@wordpress/i18n';
import { plugin_root_url } from '@GFUtils/helper';
import Button from '@GFComponents/Button';
import { buildPurchaseUrl } from './helper';

const HireUs = () => {
	return (
		<div className="gameengine-hire-us">
			<div className="gameengine-hire-us__content">
				<h3 className="gameengine-hire-us__title">
					{__('Need Expert Help? Hire Our Professionals', 'gameengine')}
				</h3>
				<p className="gameengine-hire-us__desc">
					{__(
						'Get access to a skilled team of designers, developers, marketers, and content experts—ready to bring your ideas to life.',
						'gameengine'
					)}
				</p>
				<div className="gameengine-hire-us__actions">
					<Button
						label={__('Hire Us', 'gameengine')}
						type="link"
						link={buildPurchaseUrl(
							'https://kodezen.agency/request-a-free-call/'
						)}
						target="_blank"
						preset="purple"
						size="md"
					/>
					<Button
						label={__('Learn More', 'gameengine')}
						type="link"
						link={buildPurchaseUrl('https://kodezen.agency/')}
						target="_blank"
						preset="white-border"
						size="md"
					/>
				</div>
			</div>

			<img
				src={plugin_root_url + '/assets/images/employees.png'}
				alt="kodezen Employees"
				className="gameengine-hire-us__avatar"
			/>
		</div>
	);
};

export default HireUs;
