import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

export const fetchNotifications = createAsyncThunk('notificationCenter/fetch', async (_, { rejectWithValue }) => {
    try {
        const response = await apiFetch({
            path: '/gameengine/v1/notifications?per_page=10',
            parse: false,
        });
        const unread = response.headers.get('X-GE-Unread');
        const data = await response.json();
        return { items: data, unread: parseInt(unread) || 0 };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const markRead = createAsyncThunk('notificationCenter/markRead', async (id, { rejectWithValue }) => {
    try {
        await apiFetch({ path: '/gameengine/v1/notifications/' + id + '/read', method: 'PUT' });
        return id;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const markAllRead = createAsyncThunk('notificationCenter/markAllRead', async (_, { rejectWithValue }) => {
    try {
        await apiFetch({ path: '/gameengine/v1/notifications/read-all', method: 'DELETE' });
        return true;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const notificationCenterSlice = createSlice({
    name: 'notificationCenter',
    initialState: {
        items: [],
        unread: 0,
        isOpen: false,
        status: 'idle',
    },
    reducers: {
        toggleBell: (state) => {
            state.isOpen = !state.isOpen;
        },
        closeBell: (state) => {
            state.isOpen = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
                state.items = payload.items;
                state.unread = payload.unread;
                state.status = 'succeeded';
            })
            .addCase(markRead.fulfilled, (state, { payload }) => {
                state.items = state.items.map(n => Number(n.id) === Number(payload) ? { ...n, is_read: '1' } : n);
                state.unread = Math.max(0, state.unread - 1);
            })
            .addCase(markAllRead.fulfilled, (state) => {
                state.items = state.items.map(n => ({ ...n, is_read: '1' }));
                state.unread = 0;
            });
    }
});

export const { toggleBell, closeBell } = notificationCenterSlice.actions;
export default notificationCenterSlice.reducer;
