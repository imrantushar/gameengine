import { createSystem, defaultConfig } from '@chakra-ui/react';

export const theme = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'var(--quizpress-font)' },
				heading: { value: 'var(--quizpress-font)' },
			},
			colors: {
				brand: {
					primary: { value: 'var(--quizpress-primary-color)' },
					secondary: { value: 'var(--quizpress-secondary-color)' },
					gray: { value: 'var(--quizpress-gray-color)' },
					darkGray: { value: 'var(--quizpress-secondary-gray-color)' },
					border: { value: 'var(--quizpress-border-color)' },
					disabled: { value: 'var(--quizpress-text-disable)' },
					bgGray: { value: 'var(--quizpress-background-gray-color)' },
					warning: { value: 'var(--quizpress-warning-color)' },

					// New
					blue: { value: 'var(--quizpress-primary)' },
				},
			},
		},
	}
})

