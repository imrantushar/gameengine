import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
    return await apiFetch({ path: '/gamify/v1/settings' });
});

export const saveSettings = createAsyncThunk('settings/save', async (data) => {
    return await apiFetch({ path: '/gamify/v1/settings', method: 'POST', data });
});

const initialState = {
    general: { level_image_width: 100, level_image_height: 100 },
    email: {
        format: 'plain',
        schedule: 'immediate',
        from_name: '',
        from_address: '',
        default_content: ''
    },
    status: 'idle',
    saveStatus: 'idle', // idle, saving, saved, failed
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setGeneralField: (state, action) => {
            state.general[action.payload.field] = action.payload.value;
        },
        setEmailField: (state, action) => {
            state.email[action.payload.field] = action.payload.value;
        },
        // 🔥 NEW: Reducer to reset save status
        resetSaveStatus: (state) => {
            state.saveStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.general = action.payload.general;
                state.email = action.payload.email;
                state.status = 'succeeded';
            })
            .addCase(saveSettings.pending, (state) => { state.saveStatus = 'saving'; })
            .addCase(saveSettings.fulfilled, (state) => { state.saveStatus = 'saved'; });
    }
});

// Export resetSaveStatus
export const { setGeneralField, setEmailField, resetSaveStatus } = settingsSlice.actions;
export default settingsSlice.reducer;