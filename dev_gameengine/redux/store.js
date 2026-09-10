import { combineReducers, configureStore } from '@reduxjs/toolkit';

// Import all the reducers you have created
import appReducer from './Slices/appSlice/appSlice';
import logsReducer from './Slices/logsSlice/logsSlice';
import pointTypeReducer from './Slices/pointTypesSlice/pointTypeSlice';
import achievementsReducer from './Slices/achivementSlice/achievementsSlice';
import menuReducer from './Slices/menuSlice/menuSlice';
import dashboardReducer from './Slices/dashboardSlice/dashboardSlice';
import levelsReducer from './Slices/levelsSlice/levelsSlice';
import leaderboardReducer from './Slices/leaderboardSlice/leaderboardSlice';
import settingsReducer from './Slices/settingsSlice/settingsSlice';
import addonsReducer from './Slices/addonsSlice/addonsSlice';
import notificationReducer from './Slices/notificationSlice/notificationSlice';

import logger from 'redux-logger';

let middleware = [];

if ( process.env.NODE_ENV !== 'production' ) {
	middleware = [ logger ];
}

/**
 * Reducers for the screens this plugin ships.
 */
const staticReducers = {
    adminmenu: menuReducer,
    app: appReducer,
    logs: logsReducer,
    pointType: pointTypeReducer,
    achievements: achievementsReducer,
    levels: levelsReducer,
    dashboard: dashboardReducer,
    leaderboard: leaderboardReducer,
    settings: settingsReducer,
    addons: addonsReducer,
    notification: notificationReducer,
};

/**
 * Reducers contributed by another plugin for the screens it ships.
 */
const injectedReducers = {};

/**
 * The main Redux store for the GameEngine application.
 *
 * We use configureStore from Redux Toolkit, which simplifies store setup,
 * automatically combines slice reducers, adds necessary middleware like redux-thunk,
 * and enables the Redux DevTools Extension.
 */
export const store = configureStore({
    reducer: combineReducers(staticReducers),
    middleware: ( getDefaultMiddleware ) =>
        getDefaultMiddleware().concat( ...middleware ),
});

/**
 * Add a reducer for a screen this plugin does not ship.
 *
 * An extension registering its own pages needs somewhere to keep their state.
 * Call this before the app mounts; a key that is already taken is left alone.
 *
 * @param {string}   key     State key to mount the reducer under.
 * @param {Function} reducer The reducer.
 */
export const injectReducer = (key, reducer) => {
    if (staticReducers[key] || injectedReducers[key]) {
        return;
    }

    injectedReducers[key] = reducer;
    store.replaceReducer(combineReducers({ ...staticReducers, ...injectedReducers }));
};
