import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, handleSliceError, handleSliceSuccess, namespace } from '@GFUtils/helper';

export const fetchRewards = createAsyncThunk('rewards/fetchAll', async ({ page = 1, per_page = 20, search = '' } = {}, thunkAPI) => {
    try {
        const res = await API.get(namespace + 'rewards', { params: { page, per_page, search } });
        return {
            data: res.data,
            page,
            per_page,
            total: parseInt(res.headers['x-wp-total'] || '0', 10),
        };
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const createReward = createAsyncThunk('rewards/create', async (payload, thunkAPI) => {
    try {
        const res = await API.post(namespace + 'rewards', payload);
        handleSliceSuccess(thunkAPI, 'Reward created successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const updateReward = createAsyncThunk('rewards/update', async ({ id, payload }, thunkAPI) => {
    try {
        const res = await API.put(namespace + 'rewards/' + id, payload);
        handleSliceSuccess(thunkAPI, 'Reward updated successfully.');
        return res.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

export const deleteReward = createAsyncThunk('rewards/delete', async (id, thunkAPI) => {
    try {
        await API.delete(namespace + 'rewards/' + id);
        handleSliceSuccess(thunkAPI, 'Reward deleted successfully.');
        return id;
    } catch (error) {
        return handleSliceError(thunkAPI, error);
    }
});

const rewardsSlice = createSlice({
    name: 'rewards',
    initialState: {
        items: [],
        page: 1,
        perPage: 20,
        total: 0,
        search: '',
        status: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRewards.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchRewards.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.items = payload.data;
                state.page = payload.page;
                state.perPage = payload.per_page;
                state.total = payload.total;
            })
            .addCase(fetchRewards.rejected, (state) => { state.status = 'failed'; })
            .addCase(createReward.fulfilled, (state, { payload }) => {
                state.items = [payload, ...state.items];
                state.total += 1;
            })
            .addCase(updateReward.fulfilled, (state, { payload }) => {
                state.items = state.items.map(item => Number(item.id) === Number(payload.id) ? { ...item, ...payload } : item);
            })
            .addCase(deleteReward.fulfilled, (state, { payload }) => {
                state.items = state.items.filter(item => Number(item.id) !== Number(payload));
                state.total = Math.max(0, state.total - 1);
            });
    }
});

export default rewardsSlice.reducer;
