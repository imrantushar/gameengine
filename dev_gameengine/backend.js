import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import the Provider

import './../assets/scss/backend.scss';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../assets/scss/chakra/theme';
import { store } from '@GFRedux/store';

import AdminMenu from '@GFContainers/BackendDashboard/AdminMenu';
import { createPortal } from '@wordpress/element';
import BackendDashboard from '@GFContainers/BackendDashboard';



// document.addEventListener('DOMContentLoaded', () => {
//     const rootEl = document.getElementById('gameengine-admin-app');
//     if (rootEl) {
//         const root = createRoot(rootEl);
//         root.render(
//             <Provider store={store}>
//                 <ChakraProvider value={theme}>
//                     <HashRouter>
//                         <App />
//                     </HashRouter>
//                 </ChakraProvider>

//             </Provider>
//         );
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('gameengine-admin-app');
	if (container) {
		const root = createRoot(container);
		const menuPage = document.getElementById('toplevel_page_gameengine');
		function MenuPortal({ children }) {
			menuPage.innerHTML = '';
			return createPortal(children, menuPage);
		}
		root.render(
			<Provider store={store}>
				<ChakraProvider value={theme}>
					<Router>
						<MenuPortal>
							<AdminMenu />
						</MenuPortal>
						<BackendDashboard />
					</Router>
				</ChakraProvider>
			</Provider>
		);
	}
});