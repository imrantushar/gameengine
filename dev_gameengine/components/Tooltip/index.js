import React, { useState, useRef, useEffect } from 'react';
import "./styles.scss";

const Tooltip = ({
	children,
	content,
	position = 'top',
	showArrow = true,
	disabled = false,
	variant = "blue",
	delay = 150,
	suffix
}) => {
	const [visible, setVisible] = useState(false);
	const timeoutRef = useRef(null);
	const shouldShow = !disabled && content;

	const showTooltip = () => {
		if (!shouldShow) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setVisible(true);
	};

	const hideTooltip = () => {
		if (!shouldShow) return;

		timeoutRef.current = setTimeout(() => {
			setVisible(false);
			timeoutRef.current = null;
		}, delay);
	};

	const handleTooltipMouseEnter = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	const handleTooltipMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setVisible(false);
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const classNames = [
		"gameengine-tooltip",
		`gameengine-tooltip__variant--${variant}`,
		suffix && `gameengine-tooltip--${suffix}`
	].filter(Boolean).join(" ");

	return (
		<div
			className={classNames}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
		>
			{children}
			{(shouldShow && visible) && (
				<div
					className={`gameengine-tooltip__box gameengine-tooltip__box--${position}`}
					onMouseEnter={handleTooltipMouseEnter}
					onMouseLeave={handleTooltipMouseLeave}
				>
					{content}
					{showArrow && <div className={`gameengine-tooltip__arrow gameengine-tooltip__arrow--${position}`} />}
				</div>
			)}
		</div>
	);
};

export default Tooltip;
