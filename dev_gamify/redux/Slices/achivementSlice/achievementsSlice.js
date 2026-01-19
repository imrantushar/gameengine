import { API, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// --- Async Thunks ---
export const fetchAchievements = createAsyncThunk('gamify/fetchAchievements', async () => {
    const response =  await API.get(namespace + 'achievements');
    return response.data;
});

export const fetchAchievementById = createAsyncThunk('gamify/fetchAchievementById', async (id) => {
    const response =  await API.get(namespace + 'achievements/' + id);
    return response.data;
});

export const createAchievement = createAsyncThunk('gamify/createAchievement', async (data) => {
    const response =  await API.post(namespace + 'achievements', {
        ...data
    });
    return response.data;
});

export const updateAchievement = createAsyncThunk('gamify/updateAchievement', async ({ id, data }, {dispatch}) => {
    const response =  await API.post(namespace + 'achievements/' + id, {
        ...data
    });
    dispatch(showNotification({
        message: __('Achivement updated successfully.', 'gamify'),
        isShow: true,
        type: 'success',
    }))
    return response.data;
});

export const deleteAchievement = createAsyncThunk('gamify/deleteAchievement', async (id, {dispatch}) => {
    await API.post(namespace + 'achievements/' + id,
        { force: false },
        {
            headers: {
                'X-HTTP-Method-Override': 'DELETE',
            },
        }
    );

    dispatch(showNotification({
        message: __('Achivement deleted successfully.', 'gamify'),
        isShow: true,
        type: 'success',
    }))

    return id;
});

export const fetchTriggers = createAsyncThunk('gamify/fetchTriggers',
    async (scope = 'achievement', { rejectWithValue }) => {
        try {
            return await apiFetch({ path: `/gamify/v1/triggers?scope=${scope}` });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDynamicOptions = createAsyncThunk('gamify/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: '/gamify/v1/dynamic', method: 'POST', data: { integration, query } });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPointTypes = createAsyncThunk('gamify/fetchPointTypes', async () => {
    const response =  await API.get(namespace + 'point-types');
    return response.data;
});

const initialState = {
    achievements: [],
    availablePointTypes: [],
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
            .addCase(createAchievement.fulfilled, (state, {payload}) => { 
                state.achievements = [payload, ...state.achievements]
            })
            .addCase(updateAchievement.fulfilled, (state, {payload}) => { 
                state.achievements = state.achievements.map(item => {
                    if(Number(item.id) === Number(payload.id)) {
                        return {...item, ...payload}
                    }
                    return item;
                }) 
            })
            .addCase(deleteAchievement.fulfilled, (state, {payload}) => { 
                state.achievements = state.achievements.filter(item => Number(item.id) !== Number(payload)) 
            })
    }
});

export const { updateHookSettings, resetStatus, addCategoryToList } = achievementsSlice.actions;
export default achievementsSlice.reducer;