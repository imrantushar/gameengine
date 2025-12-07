import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';

// 1. Fetch Levels
export const fetchLevels = createAsyncThunk('levels/fetchAll', async () => {
    return await apiFetch({ path: '/gamify/v1/levels' });
});

// 2. Fetch Single Level
export const fetchLevelById = createAsyncThunk('levels/fetchById', async (id) => {
    return await apiFetch({ path: `/gamify/v1/levels/${id}` });
});

// 3. Save Level
export const saveLevel = createAsyncThunk('levels/save', async (data) => {
    return await apiFetch({ path: '/gamify/v1/levels', method: 'POST', data });
});

// 4. Update Level
export const updateLevel = createAsyncThunk('levels/update', async ({ id, data }) => {
    return await apiFetch({ path: `/gamify/v1/levels/${id}`, method: 'PUT', data });
});

// 5. Delete Level
export const deleteLevel = createAsyncThunk('levels/delete', async (id) => {
    await apiFetch({ path: `/gamify/v1/levels/${id}`, method: 'DELETE' });
    return id;
});

// 6. Fetch Triggers (Scoped for Levels)
export const fetchLevelTriggers = createAsyncThunk(
    'levels/fetchTriggers',
    async (_, { rejectWithValue }) => {
        try {
            // Scope 'level' পাঠানো হচ্ছে
            return await apiFetch({ path: '/gamify/v1/triggers?scope=level' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 7. Fetch Point Types
export const fetchPointTypes = createAsyncThunk('levels/fetchPointTypes', async () => {
    return await apiFetch({ path: '/gamify/v1/point-types' });
});

const initialState = {
    levels: [],
    currentLevelId: null,

    // Fields
    title: '',
    pluralName: '',
    congratulationsMessage: '',
    unlockWithPoints: true,
    minPoints: '',
    maxPoints: '',
    selectedPointTypeId: null,
    levelIcon: '',
    priority: 0,

    // Hooks Data (Specific to Levels Page)
    allHooks: [],
    availablePointTypes: [],

    selectedHookIds: [],
    hookSettings: {},

    status: 'idle',
    saveStatus: 'idle',
};

const levelsSlice = createSlice({
    name: 'levels',
    initialState,
    reducers: {
        setField: (state, action) => {
            state[action.payload.field] = action.payload.value;
        },
        resetForm: (state) => {
            state.currentLevelId = null;
            state.title = '';
            state.pluralName = '';
            state.congratulationsMessage = '';
            state.unlockWithPoints = true;
            state.minPoints = '';
            state.maxPoints = '';
            state.selectedPointTypeId = null;
            state.levelIcon = '';
            state.selectedHookIds = [];
            state.hookSettings = {};
            state.saveStatus = 'idle';
        },
        addHook: (state, action) => {
            if (!state.selectedHookIds.includes(action.payload)) state.selectedHookIds.push(action.payload);
        },
        removeHook: (state, action) => {
            state.selectedHookIds = state.selectedHookIds.filter(id => id !== action.payload);
        },
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
            // Populate Triggers specifically for Levels
            .addCase(fetchLevelTriggers.fulfilled, (state, action) => {
                state.allHooks = action.payload;
            })
            // Populate Point Types
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                state.availablePointTypes = action.payload.map(pt => ({
                    label: pt.name,
                    value: String(pt.id)
                }));
            })
            .addCase(fetchLevelById.fulfilled, (state, action) => {
                const data = action.payload;
                state.currentLevelId = data.id;
                state.title = data.title;
                state.pluralName = data.plural_name;
                state.congratulationsMessage = data.congratulations_message || '';
                state.unlockWithPoints = !!parseInt(data.unlock_with_points_enabled);
                state.minPoints = data.min_points;
                state.maxPoints = data.max_points;
                state.selectedPointTypeId = data.point_type_id;
                state.levelIcon = data.icon;

                state.selectedHookIds = [];
                state.hookSettings = {};
                if (data.requirements) {
                    data.requirements.forEach(req => {
                        state.selectedHookIds.push(req.trigger_key);
                        state.hookSettings[req.trigger_key] = req.parameters;
                    });
                }
            })
            .addCase(saveLevel.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(updateLevel.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(deleteLevel.fulfilled, (state, action) => {
                state.levels = state.levels.filter(l => l.id !== action.payload);
            });
    }
});

export const { setField, resetForm, addHook, removeHook, updateHookSettings } = levelsSlice.actions;
export default levelsSlice.reducer;