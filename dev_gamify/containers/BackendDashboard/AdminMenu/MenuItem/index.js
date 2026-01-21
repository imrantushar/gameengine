import React from 'react';
import { Link } from 'react-router-dom';
import { route_path } from '@GFUtils/helper';

export default function MenuItem(props) {
	const { className, children, parent, currentPath, subMenuItems } = props;

	const redirectLink = (item) => {

		if (item.type_id) {
			return `${route_path}admin.php?page=${parent}&type_id=${item.type_id}`;
		}

		if (item.slug) {
			if (item.slug === 'question') {
				return `${route_path}admin.php?page=${parent}`;
			}
			return `${route_path}admin.php?page=${parent}&path=${item.slug}`;
		}
		return `${route_path}admin.php?page=${parent}`;
	};

	return (
		<React.Fragment>
			<li className={className}>
				{children}

				{subMenuItems && subMenuItems.length > 0 && (
					<ul className="wp-submenu custom-visible-submenu">
						{subMenuItems.map((item, index) => {
							return (
								<li
									className={
										(item.type_id && window.location.href.includes(`type_id=${item.type_id}`)) ||
											(!item.slug && !currentPath) ||
											currentPath === item.slug
											? 'current'
											: ''
									}
									key={index}
								>
									<Link to={redirectLink(item)}>

										— {item.title}
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</li>
		</React.Fragment>
	);
}