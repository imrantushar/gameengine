import classNames from 'classnames';

export function suffixClassNames( suffix, expandableSize ) {
	return classNames(
		'gamify-react-modal',
		suffix && `gamify-react-modal--${ suffix }`,
		expandableSize && `gamify-react-modal--${ expandableSize }`
	);
}

export function contentClassNames( expandableSize ) {
	return classNames(
		'gamify-react-modal__content',
		expandableSize && `gamify-react-modal--content-${ expandableSize }`
	);
}
