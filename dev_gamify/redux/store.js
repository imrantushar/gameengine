import { configureStore } from '@reduxjs/toolkit';

// Import all the reducers you have created
import appReducer from './features/appSlice';
import logsReducer from './features/logsSlice';

/**
 * The main Redux store for the Gamify application.
 *
 * We use configureStore from Redux Toolkit, which simplifies store setup,
 * automatically combines slice reducers, adds necessary middleware like redux-thunk,
 * and enables the Redux DevTools Extension.
 */
export const store = configureStore({
    reducer: {
        // Register the reducer from each slice here
        app: appReducer,
        logs: logsReducer,
        // Future reducers will be added here (e.g., points, settings)
    },
    // Redux DevTools are automatically enabled in development mode
});