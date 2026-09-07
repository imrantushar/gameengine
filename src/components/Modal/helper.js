export function suffixClassNames(suffix, expandableSize) {
	let classes = 'gameengine-modal';
	if (suffix) classes += ` gameengine-modal--${suffix}`;
	if (expandableSize) classes += ` gameengine-modal--${expandableSize}`;
	return classes;
}

export function contentClassNames(expandableSize) {
	let classes = 'gameengine-modal__content';
	if (expandableSize) classes += ` gameengine-modal--content-${expandableSize}`;
	return classes;
}
