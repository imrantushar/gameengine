import { createSystem, defaultConfig } from '@chakra-ui/react';

export const theme = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'var(--gamify-font)' },
				heading: { value: 'var(--gamify-font)' },
			},
			colors: {
				brand: {
					primary: { value: 'var(--gamify-primary-color)' },
					secondary: { value: 'var(--gamify-secondary-color)' },
					gray: { value: 'var(--gamify-gray-color)' },
					darkGray: { value: 'var(--gamify-secondary-gray-color)' },
					border: { value: 'var(--gamify-border-color)' },
					disabled: { value: 'var(--gamify-text-disable)' },
					bgGray: { value: 'var(--gamify-background-gray-color)' },
					warning: { value: 'var(--gamify-warning-color)' },

					// New
					blue: { value: 'var(--gamify-primary)' },
				},
			},
		},
	}
})

