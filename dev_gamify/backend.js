import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import the Provider

import { store } from './redux/store'; // Import your store
import App from '@Components/App';

document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('gamify-admin-app');
    if (rootEl) {
        const root = createRoot(rootEl);
        root.render(
            // Wrap the entire application with the Provider and pass the store
            <Provider store={store}>
                <HashRouter>
                    <App />
                </HashRouter>
            </Provider>
        );
    }
});