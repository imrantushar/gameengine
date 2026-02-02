import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './../assets/scss/chakra/theme';
import Setup from '@GFContainers/Setup';
import { HashRouter } from 'react-router-dom';
import './../assets/scss/setup.scss';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gameengine-setup-app');
    if (container) {
        const root = createRoot(container);
        root.render(
            <ChakraProvider value={theme}>
                <HashRouter basename="/">
                    <Setup />
                </HashRouter>
            </ChakraProvider>
        );
    }
});