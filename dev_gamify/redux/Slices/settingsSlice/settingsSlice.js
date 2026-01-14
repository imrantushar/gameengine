import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchSettings = createAsyncThunk('gamify/fetchSettings', async () => {
    return await apiFetch({ path: '/gamify/v1/settings' });
});

export const saveSettings = createAsyncThunk('gamify/saveSettings', async (data) => {
    return await apiFetch({ path: '/gamify/v1/settings', method: 'POST', data });
});

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        data: false
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(saveSettings.fulfilled, (state) => { 
                
            });
    }
});

export default settingsSlice.reducer;