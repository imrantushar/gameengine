import { configureStore } from '@reduxjs/toolkit';

// Import all the reducers you have created
import appReducer from './Slices/appSlice/appSlice';
import logsReducer from './Slices/logsSlice/logsSlice';
import pointTypeReducer from './Slices/pointTypesSlice/pointTypeSlice';
import achievementsReducer from './Slices/achivementSlice/achievementsSlice';
import menuReducer from './Slices/menuSlice/menuSlice';
import dashboardReducer from './Slices/dashboardSlice/dashboardSlice';
import levelsReducer from './Slices/levelsSlice/levelsSlice';
import leaderboardReducer from './Slices/leaderboardSlice/leaderboardSlice';
import logger from 'redux-logger'
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
        dashboard: dashboardReducer,
        leaderboard: leaderboardReducer,
        // Future reducers will be added here (e.g., points, settings)
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(logger),
});