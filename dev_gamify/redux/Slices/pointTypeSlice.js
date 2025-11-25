import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// Fetch Hooks
export const fetchTriggers = createAsyncThunk(
    'pointType/fetchTriggers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiFetch({ path: '/gamify/v1/triggers' });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Save Point Type
export const savePointType = createAsyncThunk(
    'pointType/save',
    async (pointData, { rejectWithValue }) => {
        try {
            return await apiFetch({
                path: '/gamify/v1/point-types',
                method: 'POST',
                data: pointData,
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    name: '',
    pluralName: '',
    allHooks: [], // Raw hooks from API

    selectedAwardHookIds: [],
    selectedDeductHookIds: [],

    // Stores settings for each hook. Key format: "type_hookId" (e.g., "award_wp_login")
    hookSettings: {},

    status: 'idle',
    saveStatus: 'idle',
    error: null,
};

const pointTypeSlice = createSlice({
    name: 'pointType',
    initialState,
    reducers: {
        setPointName: (state, action) => {
            state.name = action.payload;
        },
        setPluralName: (state, action) => {
            state.pluralName = action.payload;
        },

        // --- Awards ---
        addAwardHook: (state, action) => {
            const hookId = action.payload;
            if (!state.selectedAwardHookIds.includes(hookId)) {
                state.selectedAwardHookIds.push(hookId);
            }
        },
        removeAwardHook: (state, action) => {
            state.selectedAwardHookIds = state.selectedAwardHookIds.filter(id => id !== action.payload);
            // Optional: cleanup settings
            delete state.hookSettings[`award_${action.payload}`];
        },

        // --- Deductions ---
        addDeductHook: (state, action) => {
            const hookId = action.payload;
            if (!state.selectedDeductHookIds.includes(hookId)) {
                state.selectedDeductHookIds.push(hookId);
            }
        },
        removeDeductHook: (state, action) => {
            state.selectedDeductHookIds = state.selectedDeductHookIds.filter(id => id !== action.payload);
            delete state.hookSettings[`deduct_${action.payload}`];
        },

        // --- Settings Update ---
        updateHookSettings: (state, action) => {
            const { type, hookId, settings } = action.payload;
            // type is 'award' or 'deduct'
            const key = `${type}_${hookId}`;
            state.hookSettings[key] = {
                ...state.hookSettings[key],
                ...settings
            };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTriggers.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchTriggers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.allHooks = action.payload;
            })
            .addCase(savePointType.pending, (state) => { state.saveStatus = 'saving'; })
            .addCase(savePointType.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(savePointType.rejected, (state) => { state.saveStatus = 'failed'; });
    },
});

export const {
    setPointName, setPluralName,
    addAwardHook, removeAwardHook,
    addDeductHook, removeDeductHook,
    updateHookSettings
} = pointTypeSlice.actions;

export default pointTypeSlice.reducer;