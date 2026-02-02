import { addons, API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { showNotification } from '../notificationSlice/notificationSlice';

export const fetchAddons = createAsyncThunk('gameengine/fetchAddons', async () => {
    return await apiFetch({ path: '/gameengine/v1/addons' });
});

export const saveAddon = createAsyncThunk('gameengine/saveAddon', async ({ addon, status }, thunkAPI) => {
    try {
        const response = await API.post('gameengine/v1/addons',{ addon, status });
        return {
            active_addons: response?.data?.active_addons,
            success: true
        }
    } catch (error) {
        thunkAPI.dispatch(
            showNotification( {
                message: error?.response.data.message,
                isShow: true,
                type: 'error',
            } )
        );
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
                if(action?.payload?.active_addons) {
                    return action?.payload?.active_addons;
                }
            });
    }
});

export default addonsSlice.reducer;