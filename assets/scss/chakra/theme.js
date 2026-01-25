import { createSystem, defaultConfig } from '@chakra-ui/react';

export const theme = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'var(--gameengine-font)' },
				heading: { value: 'var(--gameengine-font)' },
			},
			colors: {
				brand: {
					primary: { value: 'var(--gameengine-primary-color)' },
					secondary: { value: 'var(--gameengine-secondary-color)' },
					gray: { value: 'var(--gameengine-gray-color)' },
					darkGray: { value: 'var(--gameengine-secondary-gray-color)' },
					border: { value: 'var(--gameengine-border-color)' },
					disabled: { value: 'var(--gameengine-text-disable)' },
					bgGray: { value: 'var(--gameengine-background-gray-color)' },
					warning: { value: 'var(--gameengine-warning-color)' },

					// New
					blue: { value: 'var(--gameengine-primary)' },
				},
			},
		},
	}
})

