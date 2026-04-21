import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { __ } from '@wordpress/i18n';
import { API, handleSliceError, namespace } from '@GFUtils/helper';

// --- 1. Fetch Referrals ---
export const fetchReferrals = createAsyncThunk('gameengine/fetchReferrals',
    async ({ page = 1, per_page = 10, search = '' }, thunkAPI) => {
        try {
            let params = '?page=' + page;
            if (per_page) params += '&per_page=' + per_page;
            if (search) params += '&search=' + search;
            const response = await API.get(namespace + 'referrals' + params);
            return {
                data: response?.data,
                total: response.headers.get('X-WP-Total'),
                page,
                per_page
            };
        } catch (error) {
            handleSliceError(thunkAPI, error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// --- 2. Fetch Stats ---
export const fetchReferralStats = createAsyncThunk('gameengine/fetchReferralStats',
    async (_, thunkAPI) => {
        try {
            const response = await API.get(namespace + 'referrals/stats');
            return response.data;
        } catch (error) {
            handleSliceError(thunkAPI, error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// --- 3. Delete Referral ---
export const deleteReferral = createAsyncThunk('gameengine/deleteReferral',
    async (id, thunkAPI) => {
        try {
            await API.delete(namespace + 'referrals/' + id);
            return id;
        } catch (error) {
            handleSliceError(thunkAPI, error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const referralSlice = createSlice({
    name: 'referrals',
    initialState: {
        items: [],
        totalItems: 0,
        currentPage: 1,
        perPage: 10,
        search: '',
        stats: {
            total_referrals: 0,
            converted: 0,
            top_referrer_name: '',
            top_referrer_count: 0
        },
        status: 'idle',
        error: null,
    },
    reducers: {
        setPage: (state, action) => { state.currentPage = action.payload; },
        setSearchQuery: (state, action) => { state.search = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReferrals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReferrals.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.items = payload.data || [];
                state.totalItems = payload.total || 0;
                state.currentPage = payload.page;
                state.perPage = payload.per_page;
            })
            .addCase(fetchReferrals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchReferralStats.fulfilled, (state, { payload }) => {
                state.stats = payload;
            })
            .addCase(deleteReferral.fulfilled, (state, { payload }) => {
                state.items = state.items.filter(item => Number(item.id) !== Number(payload));
                state.totalItems -= 1;
            });
    },
});

export const { setPage, setSearchQuery } = referralSlice.actions;
export default referralSlice.reducer;
