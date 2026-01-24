import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchSettings = createAsyncThunk('gamify/fetchSettings', async () => {
    return await apiFetch({ path: '/gamify/v1/settings' });
});

export const saveSettings = createAsyncThunk('gamify/saveSettings', async ({apiSlug="", key,payloadData}) => {
    await apiFetch({ path: '/gamify/v1/settings/'+ apiSlug, method: 'POST', data: {[`${key}`]: payloadData} });
    return {
        key,
        data: payloadData
    }
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
            .addCase(saveSettings.fulfilled, (state, action) => { 
                const {key, data} = action.payload;
                state.data = {
                    ...state.data,
                    [`${key}`]: {
                        ...state.data[`${key}`],
                        ...data
                    }
                }
            });
    }
});

export default settingsSlice.reducer;