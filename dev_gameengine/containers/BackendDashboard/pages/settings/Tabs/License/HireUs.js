import React from 'react';
import { __ } from '@wordpress/i18n';
import { plugin_root_url } from '@GFUtils/helper';
import { buildPurchaseUrl } from './helper';
const HireUs = ({
  sdk
}) => {
  return <div className="flex items-center justify-between flex-wrap gap-6 bg-white rounded mt-6 p-4 [box-shadow:var(--gameengine-shadow)]">
			<div className="flex-1" style={{
      "minWidth": "220px"
    }}>
				<p className="text-xl font-medium m-0 text-[var(--gameengine-font-color)]" style={{
        "lineHeight": "30px",
        "marginBottom": "8px !important"
      }}>
					{__('Need Expert Help? Hire Our Professionals', 'gameengine')}
				</p>
				<p className="text-sm font-normal leading-5 m-0 text-[var(--gameengine-secondary)]" style={{
        "maxWidth": "85%"
      }}>
					{__('Get access to a skilled team of designers, developers, marketers, and content experts—ready to bring your ideas to life.', 'gameengine')}
				</p>
				<div className="flex items-center gap-3" marginTop={'24px'}>
					<button className="cursor-pointer text-white h-10 pl-5 pr-5 text-sm font-medium rounded bg-[var(--gameengine-primary)]" as="a" href={buildPurchaseUrl('https://kodezen.agency/request-a-free-call/', sdk)} target="_blank" rel="noopener noreferrer">
						{__('Hire Us', 'gameengine')}
					</button>
					<button className="cursor-pointer bg-transparent h-10 pl-5 pr-5 text-sm font-medium rounded text-[var(--gameengine-secondary)]" style={{
          "border": "1px solid",
          "borderColor": "gray.300"
        }} as="a" href={buildPurchaseUrl('https://kodezen.agency/', sdk)} target="_blank" rel="noopener noreferrer">
						{__('Learn More', 'gameengine')}
					</button>
				</div>
			</div>

			{/* Right: avatar grid */}
			<div className="flex flex-col gap-2 shrink-0" style={{
      "width": "35%"
    }}>
					<div className="flex w-full items-center justify-center gap-2">
							<img className="w-full shrink-0" src={plugin_root_url + 'assets/images/employees.png'} alt={__('Kodezen Employee', 'gameengine')} title={__('Kodezen Employee', 'gameengine')} objectFit="cover" />
					</div>
			</div>
		</div>;
};
export default HireUs;