import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';
import { createAchievementType, deleteAchievementType, fetchAchievementTypeById, fetchAchievementTypes, updateAchievementType } from './types';

// --- Async Thunks ---
export const fetchAchievements = createAsyncThunk('gameengine/fetchAchievements', async ({status = 'all', page = 1, per_page= 15, search= ""}, { rejectWithValue }) => {
    let params = {
        status: status === 'all' ? 'any' : status,
        page,
        per_page,
    };
    if (search) params = { ...params, search };

    try {
        const response =  await API.get(namespace + 'achievements', {params});

        return {
            data: response.data,
            ...params,
            total: parseInt(response.headers['x-wp-total']),
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const fetchAchievementById = createAsyncThunk('gameengine/fetchAchievementById', async (id) => {
    const response =  await API.get(namespace + 'achievements/' + id);
    return response.data;
});

export const createAchievement = createAsyncThunk('gameengine/createAchievement', async (data, thunkAPI) => {
    try {
        const response =  await API.post(namespace + 'achievements', {
            ...data
        });
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const updateAchievement = createAsyncThunk('gameengine/updateAchievement', async ({ id, data }, {dispatch}) => {
    const response =  await API.post(namespace + 'achievements/' + id, {
        ...data
    });
    dispatch(showNotification({
        message: __('Achivement updated successfully.', 'gameengine'),
        isShow: true,
        type: 'success',
    }))
    return response.data;
});

export const deleteAchievement = createAsyncThunk('gameengine/deleteAchievement', async (id, {dispatch}) => {
    await API.post(namespace + 'achievements/' + id,
        { force: false },
        {
            headers: {
                'X-HTTP-Method-Override': 'DELETE',
            },
        }
    );

    dispatch(showNotification({
        message: __('Achivement deleted successfully.', 'gameengine'),
        isShow: true,
        type: 'success',
    }))

    return id;
});

export const fetchTriggers = createAsyncThunk('gameengine/fetchTriggers',
    async (scope = 'achievement', { rejectWithValue }) => {
        try {
            return await apiFetch({ path: `/gameengine/v1/triggers?scope=${scope}` });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDynamicOptions = createAsyncThunk('gameengine/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: '/gameengine/v1/dynamic', method: 'POST', data: { integration, query } });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPointTypes = createAsyncThunk('gameengine/achivementsfetchPointTypes', async () => {
    const response =  await API.get(namespace + 'point-types');
    return response.data;
});

const initialState = {
    achievements: [],
    // Whether a list request has come back. An empty list only means "there is
    // nothing here" once this is true; before that it is just the initial state,
    // and screens must not read it as an empty result.
    listLoaded: false,
    types: {
        data: [],
    },
    availablePointTypes: [],
    integrations: {},
    allHooks: [],
    hookSettings: {},
    status: 'idle',
    saveStatus: 'idle',
    error: null,
    status: "all",
    page: 1,
    perPage: 15,
    search: '',
    total: '',
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
                const {data, page, per_page, total, search} = action.payload;
                state.listLoaded = true;
                state.achievements = data;
                state.page = page;
                state.perPage = per_page;
                state.total = total;
                state.search = search;
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
                state.availablePointTypes = action?.payload?.map(pt => ({ label: pt.name, value: String(pt.id) }));
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
            // types
            .addCase(fetchAchievementTypes.fulfilled, (state, action) => {
                state.types.data = action.payload;
            })
            .addCase(fetchAchievementTypeById.fulfilled, (state, action) => {
                const data = action.payload;
                state.types.data = [data, ...state.types.data];
            })
            .addCase(createAchievementType.fulfilled, (state, {payload}) => { 
                state.types.data = [payload, ...state.types.data]
            })
            .addCase(updateAchievementType.fulfilled, (state, {payload}) => { 
                state.types.data = state.types.data.map(item => {
                    if(Number(item.id) === Number(payload.id)) {
                        return {...item, ...payload}
                    }
                    return item;
                }) 
            })
            .addCase(deleteAchievementType.fulfilled, (state, {payload}) => { 
                state.types.data = state.types.data.filter(item => Number(item.id) !== Number(payload)) 
            })
    }
});

export const { updateHookSettings, resetStatus, addCategoryToList } = achievementsSlice.actions;
export default achievementsSlice.reducer;