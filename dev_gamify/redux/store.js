import { configureStore } from '@reduxjs/toolkit';

// Import all the reducers you have created
import appReducer from './Slices/appSlice';
import logsReducer from './Slices/logsSlice';
import pointTypeReducer from './Slices/pointTypeSlice';
import achievementsReducer from './Slices/achievementsSlice';
import menuReducer from './Slices/menuSlice/menuSlice';
import levelsReducer from './Slices/levelsSlice';
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
        adminmenu: menuReducer,
        app: appReducer,
        logs: logsReducer,
        pointType: pointTypeReducer,
        achievements: achievementsReducer,
        levels: levelsReducer,
        // Future reducers will be added here (e.g., points, settings)
    },
    // Redux DevTools are automatically enabled in development mode
});