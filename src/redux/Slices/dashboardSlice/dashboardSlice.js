import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async (params = {}, { rejectWithValue }) => {
        try {
            // Construct path with query arguments if params exist
            const path = addQueryArgs('/gameengine/v1/dashboard', params);
            return await apiFetch({ path });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    overview: { points: 0, points_deducted: 0, achievements: 0, levels: 0, active_users: 0 },
    chart: { labels: [], points: [], achievements: [], levels: [] },
    topUsers: [],
    status: 'idle',
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.overview = action.payload.overview;
                state.chart = action.payload.chart;
                state.topUsers = action.payload.top_users;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default dashboardSlice.reducer;