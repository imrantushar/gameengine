import React from 'react';
import { __ } from '@wordpress/i18n';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useThemeMode } from '@GFUtils/theme';

const ThemeToggle = ({ className = '' }) => {
	const { isDark, toggle } = useThemeMode();
	const label = isDark
		? __('Switch to light mode', 'gameengine')
		: __('Switch to dark mode', 'gameengine');

	return (
		<button
			type="button"
			onClick={toggle}
			className={`gameengine-theme-toggle ${className}`}
			aria-label={label}
			title={label}
		>
			{isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
		</button>
	);
};

export default ThemeToggle;
