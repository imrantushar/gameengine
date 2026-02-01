import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './../assets/scss/chakra/theme';
import Setup from '@GFContainers/Setup';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gameengine-setup-app');
    if (container) {
        const root = createRoot(container);
        root.render(
            <Provider store={store}>
                <ChakraProvider value={theme}>
                    <HashRouter basename="/">
                        <Setup />
                    </HashRouter>
                </ChakraProvider>
            </Provider>
        );
    }
});