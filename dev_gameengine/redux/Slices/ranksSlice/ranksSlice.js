import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, handleSliceError, handleSliceSuccess, namespace } from '@GFUtils/helper';

export const fetchRanks = createAsyncThunk('ranks/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await API.get(namespace + 'ranks');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const createRank = createAsyncThunk('ranks/create', async (payload, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'ranks', payload);
        handleSliceSuccess(thunkAPI, 'Rank created successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const updateRank = createAsyncThunk('ranks/update', async ({ id, payload }, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'ranks/' + id, payload);
        handleSliceSuccess(thunkAPI, 'Rank updated successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const deleteRank = createAsyncThunk('ranks/delete', async (id, thunkAPI) => {
    try {
        await API.post(namespace + 'ranks/' + id, {}, { headers: { 'X-HTTP-Method-Override': 'DELETE' } });
        handleSliceSuccess(thunkAPI, 'Rank deleted successfully.');
        return id;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const fetchUserRanks = createAsyncThunk('ranks/fetchUserRanks', async (userId, thunkAPI) => {
    try {
        const res = await API.get(namespace + 'ranks/user/' + userId);
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

const ranksSlice = createSlice({
    name: 'ranks',
    initialState: {
        items: [],
        userRank: null,
        status: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRanks.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchRanks.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.items = payload;
            })
            .addCase(createRank.fulfilled, (state, { payload }) => {
                state.items = [...state.items, payload].sort((a, b) => a.points_required - b.points_required);
            })
            .addCase(updateRank.fulfilled, (state, { payload }) => {
                state.items = state.items
                    .map(item => Number(item.id) === Number(payload.id) ? { ...item, ...payload } : item)
                    .sort((a, b) => a.points_required - b.points_required);
            })
            .addCase(deleteRank.fulfilled, (state, { payload }) => {
                state.items = state.items.filter(item => Number(item.id) !== Number(payload));
            })
            .addCase(fetchUserRanks.fulfilled, (state, { payload }) => {
                state.userRank = payload;
            });
    }
});

export default ranksSlice.reducer;
