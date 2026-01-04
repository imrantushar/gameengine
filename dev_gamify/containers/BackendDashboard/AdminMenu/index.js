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

const AdminMenu = () => {
	const adminmenu = useSelector( ( state ) => state.adminmenu.data );
	const location = useQuery();
	const page = location.get( 'page' );
	const path = location.get( 'path' );
	useEffect( () => {
		document.title =
			adminmenu[ page ]?.title + ' - ' + __( 'Gamify', 'gamify' );
	}, [ page ] );

	return (
		<React.Fragment>
			<Link
				to={ `${ route_path }admin.php?page=gamify` }
				className="wp-has-submenu wp-has-current-submenu wp-menu-open menu-top toplevel_page_gamify menu-top-last"
				aria-haspopup="false"
			>
				<div className="wp-menu-arrow">
					<div></div>
				</div>
				<div
					className="wp-menu-image svg"
					style={ {
						backgroundImage: `url('${
							toplevel_menu_icon_url ??
							plugin_root_url + 'assets/images/logo_black_white.svg'
						}')`,
					} }
					aria-hidden="true"
				>
					<br />
				</div>
				<div className="wp-menu-name">
					{ __( 'gamify', 'gamify' ) }
				</div>
			</Link>
			<ul className="wp-submenu wp-submenu-wrap">
				<li className="wp-submenu-head" aria-hidden="true">
					{ __( 'gamify', 'gamify' ) }
				</li>
				{ Object.entries( adminmenu ).map( ( [ key, item ], index ) => {
					if (
						[ 'gamify-get-pro', 'gamify-license' ].includes(
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
							key={ index }
							parent={ key }
							currentPath={ path }
							subMenuItems={ item.sub_items }
						>
							<Link
								to={ `${ route_path }admin.php?page=${ key }` }
							>
								{ item.title }
								{ item?.sub_items && (
									<span className="gamify-icon gamify-icon--angle-right"></span>
								) }
							</Link>
						</MenuItem>
					);
				} ) }
				{/* <>
					{ is_pro ? (
						<li
							className={
								page === 'gamify-license' ? 'current' : ''
							}
						>
							<a href="admin.php?page=gamify-license">
								{ __( 'License', 'gamify' ) }
							</a>
						</li>
					) : (
						<li
							className={
								page === 'gamify-get-pro' ? 'current' : ''
							}
						>
							<a href="admin.php?page=gamify-get-pro">
								<span className="dashicons dashicons-awards gamify-blue-color"></span>{ ' ' }
								{ __( 'Get Pro', 'gamify' ) }
							</a>
						</li>
					) }
				</> */}
			</ul>
		</React.Fragment>
	);
};

export default AdminMenu;
