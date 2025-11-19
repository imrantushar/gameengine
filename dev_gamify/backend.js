import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import the Provider

import { store } from './redux/store'; // Import your store
import App from './containers/pages';
import './../assets/scss/backend.scss';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../assets/scss/chakra/theme';


document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('gamify-admin-app');
    if (rootEl) {
        const root = createRoot(rootEl);
        root.render(
            <Provider store={store}>
                <ChakraProvider value={theme}>
                    <HashRouter>
                        <App />
                    </HashRouter>
                </ChakraProvider>

            </Provider>
        );
    }
});
