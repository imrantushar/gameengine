export function suffixClassNames(suffix, expandableSize) {
	let classes = 'gamify-modal';
	if (suffix) classes += ` gamify-modal--${suffix}`;
	if (expandableSize) classes += ` gamify-modal--${expandableSize}`;
	return classes;
}

export function contentClassNames(expandableSize) {
	let classes = 'gamify-modal__content';
	if (expandableSize) classes += ` gamify-modal--content-${expandableSize}`;
	return classes;
}
