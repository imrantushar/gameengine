import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, handleSliceError, handleSliceSuccess, namespace } from '@GFUtils/helper';

export const fetchStreaks = createAsyncThunk('streaks/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await API.get(namespace + 'streaks');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const createStreak = createAsyncThunk('streaks/create', async (payload, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'streaks', payload);
        handleSliceSuccess(thunkAPI, 'Streak created successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const updateStreak = createAsyncThunk('streaks/update', async ({ id, payload }, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'streaks/' + id, payload);
        handleSliceSuccess(thunkAPI, 'Streak updated successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const deleteStreak = createAsyncThunk('streaks/delete', async (id, thunkAPI) => {
    try {
        await API.post(namespace + 'streaks/' + id, {}, { headers: { 'X-HTTP-Method-Override': 'DELETE' } });
        handleSliceSuccess(thunkAPI, 'Streak deleted successfully.');
        return id;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

const streaksSlice = createSlice({
    name: 'streaks',
    initialState: {
        items: [],
        status: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStreaks.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchStreaks.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.items = payload;
            })
            .addCase(createStreak.fulfilled, (state, { payload }) => {
                state.items = [payload, ...state.items];
            })
            .addCase(updateStreak.fulfilled, (state, { payload }) => {
                state.items = state.items.map(item => Number(item.id) === Number(payload.id) ? { ...item, ...payload } : item);
            })
            .addCase(deleteStreak.fulfilled, (state, { payload }) => {
                state.items = state.items.filter(item => Number(item.id) !== Number(payload));
            });
    }
});

export default streaksSlice.reducer;
