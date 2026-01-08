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
    async (_, { rejectWithValue }) => {
        try {
            // Fetch triggers for achievement scope
            return await apiFetch({ path: '/gamify/v1/triggers?scope=achievement' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Dynamic Options for dropdowns (Post/Product list)
export const fetchDynamicOptions = createAsyncThunk(
    'achievements/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            return await apiFetch({
                path: '/gamify/v1/dynamic',
                method: 'POST',
                data: { integration, query }
            });
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
    currentAchievementId: null,
    congratulationsMessage: '',
    title: '',
    description: '',
    category: '',
    availableCategories: [],
    maxEarnings: 0,
    allowUnlockWithPoints: false,
    pointsAmount: '',
    selectedPointTypeId: null,
    integrations: {}, // New modular data
    allHooks: [], // Flattened for UI
    selectedHookIds: [],
    hookSettings: {},
    availablePointTypes: [],
    status: 'idle',
    saveStatus: 'idle',
    error: null,
};

const achievementsSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        setField: (state, action) => {
            state[action.payload.field] = action.payload.value;
        },
        resetForm: (state) => {
            state.currentAchievementId = null;
            state.title = '';
            state.description = '';
            state.category = '';
            state.congratulationsMessage = '';
            state.maxEarnings = 0;
            state.allowUnlockWithPoints = false;
            state.pointsAmount = '';
            state.selectedPointTypeId = null;
            state.selectedHookIds = [];
            state.hookSettings = {};
            state.saveStatus = 'idle';
        },
        addCategoryToList: (state, action) => {
            if (!state.availableCategories.includes(action.payload)) {
                state.availableCategories.push(action.payload);
            }
        },
        addHook: (state, action) => {
            if (!state.selectedHookIds.includes(action.payload)) {
                state.selectedHookIds.push(action.payload);
            }
        },
        removeHook: (state, action) => {
            state.selectedHookIds = state.selectedHookIds.filter(id => id !== action.payload);
        },
        updateHookSettings: (state, action) => {
            const { hookId, settings } = action.payload;
            state.hookSettings[hookId] = { ...state.hookSettings[hookId], ...settings };
        },
        resetStatus: (state) => {
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAchievements.fulfilled, (state, action) => {
                state.achievements = action.payload;
                const categories = action.payload
                    .map(item => item.category)
                    .filter(cat => cat && cat.trim() !== '');
                state.availableCategories = [...new Set([...state.availableCategories, ...categories])];
            })
            .addCase(fetchTriggers.fulfilled, (state, action) => {
                state.integrations = action.payload;
                // Flatten logic to prevent .filter error in UI
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
                state.availablePointTypes = action.payload.map(pt => ({
                    label: pt.name,
                    value: String(pt.id)
                }));
            })
            .addCase(fetchAchievementById.fulfilled, (state, action) => {
                const data = action.payload;
                state.currentAchievementId = data.id;
                state.title = data.title;
                state.description = data.description;
                state.category = data.category || '';
                state.congratulationsMessage = data.congratulations_message || '';
                state.maxEarnings = data.max_earnings_per_user;
                state.allowUnlockWithPoints = !!parseInt(data.unlock_with_points_enabled);
                state.pointsAmount = data.required_points_amount;
                state.selectedPointTypeId = data.required_point_type_id;

                state.selectedHookIds = [];
                state.hookSettings = {};
                if (data.requirements) {
                    data.requirements.forEach(req => {
                        state.selectedHookIds.push(req.trigger_key);
                        state.hookSettings[req.trigger_key] = req.parameters;
                    });
                }
            })
            .addCase(saveAchievement.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(updateAchievement.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(deleteAchievement.fulfilled, (state, action) => {
                state.achievements = state.achievements.filter(i => i.id !== action.payload);
            });
    }
});

export const { setField, resetForm, addHook, removeHook, updateHookSettings, resetStatus, addCategoryToList } = achievementsSlice.actions;
export default achievementsSlice.reducer;