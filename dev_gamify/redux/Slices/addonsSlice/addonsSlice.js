import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchActiveAddons = createAsyncThunk('addons/fetch', async () => {
    return await apiFetch({ path: '/gamify/v1/addons' });
});

export const toggleAddonStatus = createAsyncThunk('addons/toggle', async ({ addon, status }) => {
    return await apiFetch({
        path: '/gamify/v1/addons',
        method: 'POST',
        data: { addon, status }
    });
});

const addonsSlice = createSlice({
    name: 'addons',
    initialState: {
        activeAddons: [], // Array of active addon slugs ['woocommerce', 'certificates']
        status: 'idle'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveAddons.fulfilled, (state, action) => {
                state.activeAddons = action.payload;
            })
            .addCase(toggleAddonStatus.fulfilled, (state, action) => {
                state.activeAddons = action.payload.active_addons;
            });
    }
});

export default addonsSlice.reducer;