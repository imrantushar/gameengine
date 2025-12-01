import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import the Provider

import './../assets/scss/backend.scss';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../assets/scss/chakra/theme';
import { store } from '@GFRedux/store';
import BackendDashboard from '@GFContainers/BackendDashboard';
import AdminMenu from '@GFContainers/BackendDashboard/AdminMenu';
import { createPortal } from 'react-dom';



// document.addEventListener('DOMContentLoaded', () => {
//     const rootEl = document.getElementById('gamify-admin-app');
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
document.addEventListener( 'DOMContentLoaded', () => {
    console.log('tram cont');
	const container = document.getElementById( 'gamify-admin-app' );
	if ( container ) {
        console.log('content load');
		const root = createRoot( container );
		const menuPage = document.getElementById( 'toplevel_page_gamify' );
        console.log({menuPage});
		function MenuPortal( { children } ) {
            console.log('protal menu');
			menuPage.innerHTML = '';
			return createPortal( children, menuPage );
		}
		root.render(
			<Provider store={ store }>
               {console.log('prodiver')}
				<ChakraProvider value={ theme }>
                      {console.log('theme')}
					<Router>
                          {console.log('router')}
						<MenuPortal>
                              {console.log('menu')}
							<AdminMenu />
						</MenuPortal>
						<BackendDashboard />
					</Router>
				</ChakraProvider>
			</Provider>
		);
	}
} );