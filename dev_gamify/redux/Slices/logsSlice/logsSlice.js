import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';
import { API, handleSliceError, namespace } from '@GFUtils/helper';

// --- 1. Fetch Logs ---
export const fetchLogs = createAsyncThunk('gamify/fetchLogs',
    async ({ page=1, per_page=10, search = '' }, thunkAPI) => {
        try {
            let params = '?page=' + page;
            if(per_page) params += '?per_page=' + per_page;
            if(search) params += '?search=' + search;
            const response =  await API.get(namespace + 'logs' + params);
            return { 
                data: response?.data, 
                total: response.headers.get('X-WP-Total'),
                page, 
                per_page
            };
        } catch (error) {
            handleSliceError(thunkAPI, error)
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const createLogAction = createAsyncThunk('gamify/createLogAction',
    async (payload, thunkAPI) => {
        try {
            const response =  await API.post(namespace + 'actions/manual', {...payload});
            thunkAPI.dispatch(showNotification({
                message: __('Log created successfully!', 'gamify'),
                isShow: true,
                type: 'success',
            }))
            return response.data;
        } catch (error) {
            handleSliceError(thunkAPI, error)
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateLogAction = createAsyncThunk('gamify/updateLogAction',
    async (data , thunkAPI) => {
        try {
            const response = await apiFetch({
                path: `/gamify/v1/logs/${data?.id}`,
                method: 'PUT', // or PATCH
                data: data
            });
            dispatch(showNotification({
                message: __('Log updated successfully!', 'gamify'),
                isShow: true,
                type: 'success',
            }))

            // Refresh logs to reflect changes
            // dispatch(fetchLogs({ page: 1, per_page: 10 }));

            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const logsSlice = createSlice({
    name: 'logs',
    initialState: {
        items: [],
        totalItems: 0,
        currentPage: 1,
        perPage: 10,
        search: '',
        status: 'idle',
        actionStatus: 'idle',
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
            .addCase(fetchLogs.fulfilled, (state, {payload}) => {
                state.items = payload.data;
                state.totalItems = payload.total;
                state.currentPage = payload.page;
                state.perPage = payload.per_page;
            })
            .addCase(createLogAction.fulfilled, (state) => { 
                state.items = [payload, ...state.items];
            })

            .addCase(updateLogAction.pending, (state) => { state.actionStatus = 'loading'; })
            .addCase(updateLogAction.fulfilled, (state) => { state.actionStatus = 'succeeded'; })
            .addCase(updateLogAction.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setPage, setRowsPerPage, setSearchQuery, resetActionStatus } = logsSlice.actions;
export default logsSlice.reducer;