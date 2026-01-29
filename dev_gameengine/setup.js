import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './../assets/scss/chakra/theme';

const SetupApp = () => (
    <ChakraProvider value={theme}>
        <div className="gf-setup-wrapper">
            <h1>GameEngine Onboarding Wizard</h1>
            {/* <SetupWizard /> */}
        </div>
    </ChakraProvider>
);

document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('gameengine-setup-app');
    if (rootEl) {
        const root = createRoot(rootEl);
        root.render(<SetupApp />);
    }
});