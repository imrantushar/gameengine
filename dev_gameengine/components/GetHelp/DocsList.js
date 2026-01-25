import React from 'react';
// import { sliceString } from '@GFUtils/helper';

const DocList = ({ title, data, notDocsFound }) => (
	<div className={`gameengine-get-help-list`}>
		<span className="gameengine-get-help-list__title">
			{title}
			{data.length > 0 && <span> ({data.length}) </span>}
		</span>

		{data.length > 0 ? (
			<ul className="gameengine-get-help-list__list-items">
				{data.map((item, index) => (
					<li key={index}>
						<a href={item.link} target="_blank" rel="noreferrer">
							<span className="gameengine-docs-title">
								{/* {sliceString(item.title, 40)} */}
                {item.title}
							</span>
							<span className="gameengine-icon gameengine-icon--go-on" />
						</a>
					</li>
				))}
			</ul>
		) : (
			<div className="gameengine-item-center">
				<div className="gameengine-item-center--linear">
					<span className="gameengine-icon gameengine-icon--search" />
				</div>

				<span className="gameengine-item-center__title">
					{notDocsFound}
				</span>
			</div>
		)}
	</div>
);

export default DocList;