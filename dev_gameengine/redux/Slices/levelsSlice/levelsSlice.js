import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';
import { createLevelType, deleteLevelType, fetchLevelTypeById, fetchLevelTypes, updateLevelType } from './types';

export const fetchLevels = createAsyncThunk('gameengine/fetchLevels', async (_,thunkAPI) => {
    try {
        const response =  await API.get(namespace + 'levels');
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const fetchLevelById = createAsyncThunk('gameengine/fetchLevelById', async (id, thunkAPI) => {
    try {
        const response =  await API.get(namespace + 'levels/' + id);
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const createLevel = createAsyncThunk('gameengine/createLevel', async (payload, thunkAPI) => {
    try {
        const response =  await API.post(namespace + 'levels/', {...payload});
        thunkAPI.dispatch(showNotification({
            message: __('Level create successfully.', 'gameengine'),
            isShow: true,
            type: 'success',
        }))
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const updateLevel = createAsyncThunk('gameengine/updateLevel', async ({ id, payload }, thunkAPI) => {
    try {
        const response =  await API.post(namespace + 'levels/' + id, {...payload});
        thunkAPI.dispatch(showNotification({
            message: __('Level update successfully.', 'gameengine'),
            isShow: true,
            type: 'success',
        }))
        return response.data;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const deleteLevel = createAsyncThunk('gameengine/deleteLevel', async (id, thunkAPI) => {
    try {
        await API.post(namespace + 'levels/' + id,
            { force: false },
            {
                headers: {
                    'X-HTTP-Method-Override': 'DELETE',
                },
            }
        );
    
        thunkAPI.dispatch(showNotification({
            message: __('Level deleted successfully.', 'gameengine'),
            isShow: true,
            type: 'success',
        }))
    
        return id;
    } catch (error) {
        return handleSliceError(thunkAPI, error)
    }
});

export const fetchLevelTriggers = createAsyncThunk('gameengine/fetchLevelTriggers',
    async (scope = 'level', { rejectWithValue }) => {
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

export const fetchPointTypes = createAsyncThunk('gameengine/fetchPointTypes', async () => {
    return await apiFetch({ path: '/gameengine/v1/point-types' });
});

const initialState = {
    levels: [],
    types: {
        data: [],
    },
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
            .addCase(createLevel.fulfilled, (state, {payload}) => { 
                state.levels = [payload, ...state.levels]
            })
            .addCase(updateLevel.fulfilled, (state,{payload}) => { 
                state.levels = state.levels.map(item => {
                    if(Number(item.id) === Number(payload.id)) {
                        return {...item, ...payload}
                    }
                    return item;
                }) 
            })
            .addCase(deleteLevel.fulfilled, (state, {payload}) => { 
                state.levels = state.levels.filter(item => Number(item.id) !== Number(payload)) 
            })
            // types
            .addCase(fetchLevelTypes.fulfilled, (state, action) => {
                state.types.data = action.payload;
            })
            .addCase(fetchLevelTypeById.fulfilled, (state, action) => {
                const data = action.payload;
                state.types.data = [data, ...state.types.data];
            })
            .addCase(createLevelType.fulfilled, (state, {payload}) => { 
                state.types.data = [payload, ...state.types.data]
            })
            .addCase(updateLevelType.fulfilled, (state, {payload}) => { 
                state.types.data = state.types.data.map(item => {
                    if(Number(item.id) === Number(payload.id)) {
                        return {...item, ...payload}
                    }
                    return item;
                }) 
            })
            .addCase(deleteLevelType.fulfilled, (state, {payload}) => { 
                state.types.data = state.types.data.filter(item => Number(item.id) !== Number(payload)) 
            })
    }
});

export const { updateHookSettings } = levelsSlice.actions;
export default levelsSlice.reducer;