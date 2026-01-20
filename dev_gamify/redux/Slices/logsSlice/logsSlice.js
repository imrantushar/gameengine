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
    async (payload , thunkAPI) => {
        try {
            const response =  await API.post(namespace + 'logs/' + payload.id, {...payload});
            thunkAPI.dispatch(showNotification({
                message: __('Log updated successfully!', 'gamify'),
                isShow: true,
                type: 'success',
            }))
            return payload;
        } catch (error) {
            handleSliceError(thunkAPI, error)
            return thunkAPI.rejectWithValue(error.message);
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
            .addCase(createLogAction.fulfilled, (state, {payload}) => { 
                state.items = [payload, ...state.items];
            })
            .addCase(updateLogAction.fulfilled, (state, {payload}) => { 
                state.items = state.items.map(item => {
                    if(Number(item.id) === Number(payload.id)) {
                        return {...item, ...payload}
                    }
                    return item;
                }) 
            });
    },
});

export const { setPage, setRowsPerPage, setSearchQuery, resetActionStatus } = logsSlice.actions;
export default logsSlice.reducer;