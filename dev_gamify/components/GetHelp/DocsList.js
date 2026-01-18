import React from 'react';
// import { sliceString } from '@GFUtils/helper';

const DocList = ({ title, data, notDocsFound }) => (
	<div className={`gamify-get-help-list`}>
		<span className="gamify-get-help-list__title">
			{title}
			{data.length > 0 && <span> ({data.length}) </span>}
		</span>

		{data.length > 0 ? (
			<ul className="gamify-get-help-list__list-items">
				{data.map((item, index) => (
					<li key={index}>
						<a href={item.link} target="_blank" rel="noreferrer">
							<span className="gamify-docs-title">
								{/* {sliceString(item.title, 40)} */}
                {item.title}
							</span>
							<span className="gamify-icon gamify-icon--go-on" />
						</a>
					</li>
				))}
			</ul>
		) : (
			<div className="gamify-item-center">
				<div className="gamify-item-center--linear">
					<span className="gamify-icon gamify-icon--search" />
				</div>

				<span className="gamify-item-center__title">
					{notDocsFound}
				</span>
			</div>
		)}
	</div>
);

export default DocList;