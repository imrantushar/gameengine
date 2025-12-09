import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// Fetch Leaderboard Data
export const fetchLeaderboard = createAsyncThunk(
    'leaderboard/fetchData',
    async ({ page, per_page, point_type, time_range }, { rejectWithValue }) => {
        try {
            // Build query params
            const params = new URLSearchParams({
                page,
                per_page,
                ...(point_type && { point_type }),
                ...(time_range && { time_range })
            });

            const response = await apiFetch({
                path: `/gamify/v1/leaderboard?${params.toString()}`,
                parse: false // Need headers for pagination
            });

            const total = response.headers.get('X-WP-Total');
            const data = await response.json();

            return { data, total: parseInt(total) };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch Point Types for Filter
export const fetchPointTypes = createAsyncThunk('leaderboard/fetchPointTypes', async () => {
    return await apiFetch({ path: '/gamify/v1/point-types' });
});

const initialState = {
    items: [],
    pointTypes: [],

    // Filter State
    selectedPointType: null,
    selectedTimeRange: null,

    // Pagination
    totalItems: 0,
    currentPage: 1,
    rowsPerPage: 10,

    status: 'idle',
    error: null,
};

const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        setPage: (state, action) => { state.currentPage = action.payload; },
        setRowsPerPage: (state, action) => { state.rowsPerPage = action.payload; },
        setFilterPointType: (state, action) => { state.selectedPointType = action.payload; },
        setFilterTimeRange: (state, action) => { state.selectedTimeRange = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.data;
                state.totalItems = action.payload.total;
            })
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                // Format for React Select
                state.pointTypes = action.payload.map(pt => ({
                    label: pt.name,
                    value: pt.id
                }));
            });
    }
});

export const { setPage, setRowsPerPage, setFilterPointType, setFilterTimeRange } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;