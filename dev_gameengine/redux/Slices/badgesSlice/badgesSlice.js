import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, handleSliceError, handleSliceSuccess, namespace } from '@GFUtils/helper';

export const fetchBadges = createAsyncThunk('badges/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await API.get(namespace + 'badges');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const createBadge = createAsyncThunk('badges/create', async (payload, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'badges', payload);
        handleSliceSuccess(thunkAPI, 'Badge created successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const updateBadge = createAsyncThunk('badges/update', async ({ id, payload }, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'badges/' + id, payload);
        handleSliceSuccess(thunkAPI, 'Badge updated successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const deleteBadge = createAsyncThunk('badges/delete', async (id, thunkAPI) => {
    try {
        await API.post(namespace + 'badges/' + id, {}, { headers: { 'X-HTTP-Method-Override': 'DELETE' } });
        handleSliceSuccess(thunkAPI, 'Badge deleted successfully.');
        return id;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

const badgesSlice = createSlice({
    name: 'badges',
    initialState: {
        items: [],
        status: 'idle',
        saveStatus: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBadges.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchBadges.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.items = payload;
            })
            .addCase(createBadge.fulfilled, (state, { payload }) => {
                state.items = [payload, ...state.items];
            })
            .addCase(updateBadge.fulfilled, (state, { payload }) => {
                state.items = state.items.map(item => Number(item.id) === Number(payload.id) ? { ...item, ...payload } : item);
            })
            .addCase(deleteBadge.fulfilled, (state, { payload }) => {
                state.items = state.items.filter(item => Number(item.id) !== Number(payload));
            });
    }
});

export default badgesSlice.reducer;
