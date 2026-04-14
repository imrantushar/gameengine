import { __ } from '@wordpress/i18n';
import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showNotification } from '../notificationSlice/notificationSlice';

export const fetchPayoutList = createAsyncThunk('gameengine/fetchPayoutList', async ({ status = 'all', page = 1, per_page = 15, search = "" }, thunkAPI) => {
    let params = {
        status: status === 'all' ? 'any' : status,
        page,
        per_page,
    };
    if (search) params = { ...params, search };
    try {
        const response = await API.get(`${namespace}pro/payout/list`, { params });
        return {
            data: response.data,
            ...params,
            total: parseInt(response.headers['x-wp-total']),
        };
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const updatePayoutStatus = createAsyncThunk('gameengine/updatePayoutStatus', async ({ id, status }, thunkAPI) => {
    try {
        const response = await API.post(`${namespace}pro/payout/update`, { id, status });
        thunkAPI.dispatch(showNotification({
            message: __('Payout update successfully.', 'gameengine'),
            isShow: true,
            type: 'success',
        }))
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

// export const payoutRequest = createAsyncThunk('gameengine/payoutRequest', async ({ id, status }, thunkAPI) => {
//     try {
//         const response = await API.post(`${namespace}pro/payout/update`, { id, status });
//         thunkAPI.dispatch(showNotification({
//             message: __('Payout update successfully.', 'gameengine'),
//             isShow: true,
//             type: 'success',
//         }))
//         return response.data;
//     } catch (error) {
//         return handleSliceError(thunkAPI, error)
//     }
// });

const initialState = {
    data: [],
    status: 'idle',
    page: 1,
    perPage: 15,
    search: '',
    total: 0,
};

const payoutSlice = createSlice({
    name: 'payouts',
    initialState,
    reducers: {
        payoutSearch: (state, { payload }) => {
            state.search = payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayoutList.fulfilled, (state, action) => {
                const { data, page, per_page, total, search } = action.payload;
                state.data = data;
                state.page = page;
                state.perPage = per_page;
                state.total = total;
                state.search = search;
            })
            .addCase(updatePayoutStatus.fulfilled, (state, { payload }) => {
                state.data = state.data.map(item => {
                    if (Number(item.id) === Number(payload.id)) {
                        return { ...item, ...payload, status: payload.status || item.status }
                    }
                    return item;
                })
            })
    }
});

export const {payoutSearch } = payoutSlice.actions;
export default payoutSlice.reducer;