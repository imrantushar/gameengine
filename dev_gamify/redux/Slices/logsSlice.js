import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// --- 1. Fetch Logs (With Pagination & Search) ---
export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async ({ page, per_page, search = '' }, { rejectWithValue }) => {
        try {
            // Construct Query Params
            const path = `/gamify/v1/logs?page=${page}&per_page=${per_page}&search=${search}`;

            // parse: false is needed to access Headers for pagination counts
            const response = await apiFetch({ path, parse: false });

            const total = response.headers.get('X-WP-Total');
            const data = await response.json();

            return {
                data,
                total: parseInt(total || 0, 10)
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. Manual Action Trigger ---
export const manualLogAction = createAsyncThunk(
    'logs/manualAction',
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiFetch({
                path: '/gamify/v1/actions/manual',
                method: 'POST',
                data: formData
            });

            // Refresh logs list immediately after successful action
            dispatch(fetchLogs({ page: 1, per_page: 10 }));

            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const logsSlice = createSlice({
    name: 'logs',
    initialState: {
        items: [],          // The logs list
        totalItems: 0,      // Total count from DB
        currentPage: 1,
        rowsPerPage: 10,
        searchQuery: '',

        status: 'idle',       // 'idle' | 'loading' | 'succeeded' | 'failed'
        actionStatus: 'idle', // For the manual action modal
        error: null,
    },
    reducers: {
        setPage: (state, action) => { state.currentPage = action.payload; },
        setRowsPerPage: (state, action) => { state.rowsPerPage = action.payload; },
        setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
        resetActionStatus: (state) => { state.actionStatus = 'idle'; }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Logs ---
            .addCase(fetchLogs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.data;
                state.totalItems = action.payload.total;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // --- Manual Action ---
            .addCase(manualLogAction.pending, (state) => {
                state.actionStatus = 'loading';
            })
            .addCase(manualLogAction.fulfilled, (state) => {
                state.actionStatus = 'succeeded';
            })
            .addCase(manualLogAction.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setPage, setRowsPerPage, setSearchQuery, resetActionStatus } = logsSlice.actions;
export default logsSlice.reducer;