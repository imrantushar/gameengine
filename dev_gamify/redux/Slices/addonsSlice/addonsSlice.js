import { addons } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchAddons = createAsyncThunk('gamify/fetchAddons', async () => {
    return await apiFetch({ path: '/gamify/v1/addons' });
});

export const saveAddon = createAsyncThunk('gamify/saveAddon', async ({ addon, status }) => {
    const response = await apiFetch({
        path: '/gamify/v1/addons',
        method: 'POST',
        data: { addon, status }
    });
    return {
        active_addons: response?.active_addons,
        success: true
    }
});

const addonsSlice = createSlice({
    name: 'addons',
    initialState: addons,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddons.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(saveAddon.fulfilled, (state, action) => {
                return action.payload.active_addons;
            });
    }
});

export default addonsSlice.reducer;