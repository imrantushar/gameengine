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
			adminmenu[ page ]?.title + ' - ' + __( 'Gamify', 'quizpress' );
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
					{ __( 'QuizPress', 'quizpress' ) }
				</div>
			</Link>
			<ul className="wp-submenu wp-submenu-wrap">
				<li className="wp-submenu-head" aria-hidden="true">
					{ __( 'QuizPress', 'quizpress' ) }
				</li>
				{ Object.entries( adminmenu ).map( ( [ key, item ], index ) => {
					if (
						[ 'quizpress-get-pro', 'quizpress-license' ].includes(
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
									<span className="quizpress-icon quizpress-icon--angle-right"></span>
								) }
							</Link>
						</MenuItem>
					);
				} ) }
				{/* <>
					{ is_pro ? (
						<li
							className={
								page === 'quizpress-license' ? 'current' : ''
							}
						>
							<a href="admin.php?page=quizpress-license">
								{ __( 'License', 'quizpress' ) }
							</a>
						</li>
					) : (
						<li
							className={
								page === 'quizpress-get-pro' ? 'current' : ''
							}
						>
							<a href="admin.php?page=quizpress-get-pro">
								<span className="dashicons dashicons-awards quizpress-blue-color"></span>{ ' ' }
								{ __( 'Get Pro', 'quizpress' ) }
							</a>
						</li>
					) }
				</> */}
			</ul>
		</React.Fragment>
	);
};

export default AdminMenu;
