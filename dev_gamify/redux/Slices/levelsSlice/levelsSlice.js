import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// --- Async Thunks ---
export const fetchLevels = createAsyncThunk('gamify/fetchLevels', async () => {
    return await apiFetch({ path: '/gamify/v1/levels' });
});

export const fetchLevelById = createAsyncThunk('gamify/fetchLevelById', async (id) => {
    return await apiFetch({ path: `/gamify/v1/levels/${id}` });
});

export const saveLevel = createAsyncThunk('gamify/saveLevel', async (data) => {
    return await apiFetch({ path: '/gamify/v1/levels', method: 'POST', data });
});

export const updateLevel = createAsyncThunk('gamify/updateLevel', async ({ id, data }) => {
    return await apiFetch({ path: `/gamify/v1/levels/${id}`, method: 'PUT', data });
});

export const deleteLevel = createAsyncThunk('gamify/deleteLevel', async (id) => {
    await apiFetch({ path: `/gamify/v1/levels/${id}`, method: 'DELETE' });
    return id;
});

export const fetchLevelTriggers = createAsyncThunk(
    'gamify/fetchLevelTriggers',
    async (scope = 'level', { rejectWithValue }) => {
        try {
            // শুধুমাত্র level স্কোপের ট্রিগার আনবে
            return await apiFetch({ path: `/gamify/v1/triggers?scope=${scope}` });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDynamicOptions = createAsyncThunk(
    'gamify/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: '/gamify/v1/dynamic', method: 'POST', data: { integration, query } });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPointTypes = createAsyncThunk('gamify/fetchPointTypes', async () => {
    return await apiFetch({ path: '/gamify/v1/point-types' });
});

const initialState = {
    levels: [],
    integrations: [],
    allHooks: [],
    hookSettings: {},
    status: 'idle',
    saveStatus: 'idle',
};

const levelsSlice = createSlice({
    name: 'levels',
    initialState,
    reducers: {
        updateHookSettings: (state, action) => {
            const { hookId, settings } = action.payload;
            state.hookSettings[hookId] = { ...state.hookSettings[hookId], ...settings };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLevels.fulfilled, (state, action) => {
                state.levels = action.payload;
            })
            .addCase(fetchLevelTriggers.fulfilled, (state, action) => {
                state.integrations = action.payload;
                const flattened = [];
                Object.keys(action.payload).forEach(slug => {
                    const integration = action.payload[slug];
                    Object.keys(integration.triggers).forEach(triggerKey => {
                        flattened.push({
                            id: triggerKey,
                            integrationSlug: slug,
                            ...integration.triggers[triggerKey]
                        });
                    });
                });
                state.allHooks = flattened;
            })
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                state.availablePointTypes = action.payload.map(pt => ({ label: pt.name, value: String(pt.id) }));
            })
            .addCase(fetchLevelById.fulfilled, (state, action) => {
                const data = action.payload;
                if(state.levels.length > 0) {
                    state.levels = state.levels.map(item => {
                        if(Number(item.id) === Number(data.id)) {
                            return {...item, ...data}
                        }
                        return item;
                    })
                } else {
                    state.levels = [data]
                }
            })
            .addCase(saveLevel.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(updateLevel.fulfilled, (state) => { state.saveStatus = 'saved'; });
    }
});

export const { updateHookSettings } = levelsSlice.actions;
export default levelsSlice.reducer;