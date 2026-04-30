import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import {
	route_path,
	toplevel_menu_icon_url,
	toplevel_menu_title,
	is_pro,
	plugin_root_url,
	useQuery,
} from '@GFUtils/helper';
import { useSelector } from 'react-redux';
import MenuItem from './MenuItem';
import { Icon } from '@GFComponents/UI';
import { LiaAngleRightSolid } from "react-icons/lia";

const AdminMenu = () => {
	const adminmenu = useSelector((state) => state.adminmenu.data);
	const location = useQuery();
	const page = location.get('page');
	const path = location.get('path');
	useEffect(() => {
		document.title =
			adminmenu[page]?.title + ' - ' + __('GameEngine', 'gameengine');
	}, [page]);

	return (
		<React.Fragment>
			<Link
				to={`${route_path}admin.php?page=gameengine`}
				className="wp-has-submenu wp-has-current-submenu wp-menu-open menu-top toplevel_page_gameengine menu-top-last"
				aria-haspopup="false"
			>
				<div className="wp-menu-arrow">
					<div></div>
				</div>
				<div
					className="wp-menu-image svg"
					style={{
						backgroundImage: `url('${toplevel_menu_icon_url ??
							plugin_root_url + 'assets/images/black_white_logo.svg'
							}')`,
					}}
					aria-hidden="true"
				>
					<br />
				</div>
				<div className="wp-menu-name">
					{__('GameEngine', 'gameengine')}
				</div>
			</Link>
			<ul className="wp-submenu wp-submenu-wrap">
				<li className="wp-submenu-head" aria-hidden="true">
					{__('GameEngine', 'gameengine')}
				</li>
				{Object.entries(adminmenu).map(([key, item], index) => {
					if (
						['gameengine-get-pro', 'gameengine-license'].includes(
							key
						)
					) {
						return null;
					}
					const menuItemClassName =
						index === 0 ? 'wp-first-item ' : '';
					return (
						<MenuItem
							className={
								page === key
									? menuItemClassName + 'current'
									: menuItemClassName
							}
							key={index}
							parent={key}
							currentPath={path}
							subMenuItems={item.sub_items}
						>
							<Link
								to={`${route_path}admin.php?page=${key}`}
							>
								{item.title}
								{item?.sub_items && (
									<Icon className='gameengine-icon gameengine-icon--angle-right' color={'#fff'} as={LiaAngleRightSolid} />
								)}
							</Link>
						</MenuItem>
					);
				})}
				<>
					{is_pro ? (
						<li
							className={
								(page === 'gameengine-settings' && location.get('tab') === 'license') || page === 'gameengine-license' ? 'current' : ''
							}
						>
							<a href="admin.php?page=gameengine-settings&settings=1&tab=license">
								{__('License', 'gameengine')}
							</a>
						</li>
					) : (
						<li
							className={
								page === 'gameengine-get-pro' ? 'current' : ''
							}
						>
							<a href="https://gameengine.pro/" target='_blank'>
								<span className="dashicons dashicons-awards gameengine-blue-color"></span>{' '}
								{__('Get Pro', 'gameengine')}
							</a>
						</li>
					)}
				</>
			</ul>
		</React.Fragment>
	);
};

export default AdminMenu;
