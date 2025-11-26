import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// --- Existing Thunks ---
export const fetchTriggers = createAsyncThunk(
    'pointType/fetchTriggers',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: '/gamify/v1/triggers' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

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

// --- NEW: Fetch All Point Types ---
export const fetchPointTypes = createAsyncThunk(
    'pointType/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            // GET request to /gamify/v1/point-types
            return await apiFetch({ path: '/gamify/v1/point-types' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Delete Point Type ---
export const deletePointType = createAsyncThunk(
    'pointType/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch({
                path: `/gamify/v1/point-types/${id}`, // Ensure your API supports DELETE
                method: 'DELETE',
            });
            return id; // Return the ID to remove it from state
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    // List Data
    pointTypes: [],

    // Form Data
    name: '',
    pluralName: '',
    allHooks: [],
    selectedAwardHookIds: [],
    selectedDeductHookIds: [],
    hookSettings: {},

    // Statuses
    status: 'idle',       // General status
    listStatus: 'idle',   // Specifically for the list table
    saveStatus: 'idle',
    error: null,
};

const pointTypeSlice = createSlice({
    name: 'pointType',
    initialState,
    reducers: {
        setPointName: (state, action) => { state.name = action.payload; },
        setPluralName: (state, action) => { state.pluralName = action.payload; },

        addAwardHook: (state, action) => {
            if (!state.selectedAwardHookIds.includes(action.payload)) {
                state.selectedAwardHookIds.push(action.payload);
            }
        },
        removeAwardHook: (state, action) => {
            state.selectedAwardHookIds = state.selectedAwardHookIds.filter(id => id !== action.payload);
        },
        addDeductHook: (state, action) => {
            if (!state.selectedDeductHookIds.includes(action.payload)) {
                state.selectedDeductHookIds.push(action.payload);
            }
        },
        removeDeductHook: (state, action) => {
            state.selectedDeductHookIds = state.selectedDeductHookIds.filter(id => id !== action.payload);
        },
        updateHookSettings: (state, action) => {
            const { type, hookId, settings } = action.payload;
            const key = `${type}_${hookId}`;
            state.hookSettings[key] = { ...state.hookSettings[key], ...settings };
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Triggers ---
            .addCase(fetchTriggers.fulfilled, (state, action) => {
                state.allHooks = action.payload;
            })

            // --- Save Point Type ---
            .addCase(savePointType.pending, (state) => { state.saveStatus = 'saving'; })
            .addCase(savePointType.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(savePointType.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload;
            })

            // --- Fetch List of Point Types ---
            .addCase(fetchPointTypes.pending, (state) => {
                state.listStatus = 'loading';
            })
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                state.listStatus = 'succeeded';
                state.pointTypes = action.payload;
            })
            .addCase(fetchPointTypes.rejected, (state, action) => {
                state.listStatus = 'failed';
                state.error = action.payload;
            })

            // --- Delete Point Type ---
            .addCase(deletePointType.fulfilled, (state, action) => {
                state.pointTypes = state.pointTypes.filter(pt => pt.id !== action.payload);
            });
    },
});

export const {
    setPointName, setPluralName,
    addAwardHook, removeAwardHook,
    addDeductHook, removeDeductHook,
    updateHookSettings
} = pointTypeSlice.actions;

export default pointTypeSlice.reducer;