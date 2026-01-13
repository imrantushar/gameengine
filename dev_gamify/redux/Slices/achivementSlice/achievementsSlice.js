import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// --- Async Thunks ---
export const fetchAchievements = createAsyncThunk('achievements/fetchAll', async () => {
    return await apiFetch({ path: '/gamify/v1/achievements' });
});

export const fetchAchievementById = createAsyncThunk('achievements/fetchById', async (id) => {
    return await apiFetch({ path: `/gamify/v1/achievements/${id}` });
});

export const saveAchievement = createAsyncThunk('achievements/save', async (data) => {
    return await apiFetch({ path: '/gamify/v1/achievements', method: 'POST', data });
});

export const updateAchievement = createAsyncThunk('achievements/update', async ({ id, data }) => {
    return await apiFetch({ path: `/gamify/v1/achievements/${id}`, method: 'PUT', data });
});

export const deleteAchievement = createAsyncThunk('achievements/delete', async (id) => {
    await apiFetch({ path: `/gamify/v1/achievements/${id}`, method: 'DELETE' });
    return id;
});

export const fetchTriggers = createAsyncThunk(
    'achievements/fetchTriggers',
    async (scope = 'achievement', { rejectWithValue }) => {
        try {
            return await apiFetch({ path: `/gamify/v1/triggers?scope=${scope}` });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDynamicOptions = createAsyncThunk(
    'achievements/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: '/gamify/v1/dynamic', method: 'POST', data: { integration, query } });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPointTypes = createAsyncThunk('achievements/fetchPointTypes', async () => {
    return await apiFetch({ path: '/gamify/v1/point-types' });
});

const initialState = {
    achievements: [],
    integrations: {},
    allHooks: [],
    hookSettings: {},
    status: 'idle',
    saveStatus: 'idle',
    error: null,
};

const achievementsSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        updateHookSettings: (state, action) => {
            const { hookId, settings } = action.payload;
            state.hookSettings[hookId] = { ...state.hookSettings[hookId], ...settings };
        },
        resetStatus: (state) => { state.status = 'idle'; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAchievements.fulfilled, (state, action) => {
                state.achievements = action.payload;
            })
            .addCase(fetchTriggers.fulfilled, (state, action) => {
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
            .addCase(fetchAchievementById.fulfilled, (state, action) => {
                const data = action.payload;
                state.achievements = [data];
                state.hookSettings = {};
                if (data.requirements) {
                    data.requirements.forEach(req => {
                        state.hookSettings[req.trigger_key] = req.parameters;
                    });
                }
            })
            .addCase(saveAchievement.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(updateAchievement.fulfilled, (state) => { state.saveStatus = 'saved'; });
    }
});

export const { updateHookSettings, resetStatus, addCategoryToList } = achievementsSlice.actions;
export default achievementsSlice.reducer;