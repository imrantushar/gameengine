import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

// --- 1. Fetch Available Triggers (Modular API) ---
export const fetchTriggers = createAsyncThunk(
    'gamify/fetchTriggers',
    async (scope = 'point_type', { rejectWithValue }) => { // Default scope 'point_type'
        try {
            return await apiFetch({
                path: `/gamify/v1/triggers?scope=${scope}`
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. Fetch Dynamic Options (Zaplane Style) ---
export const fetchDynamicOptions = createAsyncThunk(
    'gamify/fetchDynamicOptions',
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

// --- 3. Save Point Type (Create) ---
export const savePointType = createAsyncThunk(
    'gamify/savePointType',
    async (pointData, { rejectWithValue }) => {
        try {
            return await apiFetch({
                path: '/gamify/v1/point-types',
                method: 'POST',
                data: pointData,
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 4. Update Point Type (Edit) ---
export const updatePointType = createAsyncThunk(
    'gamify/updatePointType',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await apiFetch({
                path: `/gamify/v1/point-types/${id}`,
                method: 'PUT',
                data: data,
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 5. Fetch Single Point Type by ID ---
export const fetchPointTypeById = createAsyncThunk(
    'gamify/fetchPointTypeById',
    async (id, { rejectWithValue }) => {
        try {
            return await apiFetch({ path: `/gamify/v1/point-types/${id}` });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 6. Fetch All Point Types (List) ---
export const fetchPointTypes = createAsyncThunk(
    'gamify/fetchPointTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiFetch({ path: '/gamify/v1/point-types' });
            if (Array.isArray(response)) {
                return response.map(item => ({
                    id: item.id,
                    name: item.name,
                    pluralName: item.plural_name,
                    date: new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    })
                }));
            }
            return [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 7. Delete Point Type ---
export const deletePointType = createAsyncThunk(
    'gamify/deletePointType',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch({
                path: `/gamify/v1/point-types/${id}`,
                method: 'DELETE',
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    pointTypes: [],
    currentPointTypeId: null,
    name: '',
    pluralName: '',
    integrations: {}, // Object format for modular UI
    allHooks: [], // Flat array for backward compatibility
    selectedAwardHookIds: [],
    selectedDeductHookIds: [],
    hookSettings: {},
    status: 'idle',
    listStatus: false,
    saveStatus: 'idle',
    error: null,
};

const pointTypeSlice = createSlice({
    name: 'pointType',
    initialState,
    reducers: {
        updateHookSettings: (state, action) => {
            const { type, hookId, settings } = action.payload;
            const key = `${type}_${hookId}`;
            state.hookSettings[key] = { ...state.hookSettings[key], ...settings };
        },
        resetStatus: (state) => {
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTriggers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTriggers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.integrations = action.payload;

                const flattenedHooks = [];
                Object.keys(action.payload).forEach(slug => {
                    const integration = action.payload[slug];
                    if (integration.triggers) {
                        Object.keys(integration.triggers).forEach(triggerKey => {
                            const triggerData = integration.triggers[triggerKey];
                            flattenedHooks.push({
                                id: triggerKey,
                                integrationSlug: slug,
                                ...triggerData
                            });
                        });
                    }
                });
                state.allHooks = flattenedHooks;
            })
            .addCase(fetchTriggers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // --- Save / Update ---
            .addCase(savePointType.pending, (state) => { state.saveStatus = 'saving'; })
            .addCase(savePointType.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(savePointType.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload;
            })
            .addCase(updatePointType.pending, (state) => { state.saveStatus = 'saving'; })
            .addCase(updatePointType.fulfilled, (state) => { state.saveStatus = 'saved'; })
            .addCase(updatePointType.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload;
            })

            // --- Fetch Single by ID ---
            .addCase(fetchPointTypeById.fulfilled, (state, action) => {
                const data = action.payload;
                if(state.pointTypes.length === 0) {
                    state.pointTypes = [data]
                } else {
                    state.pointTypes = state.pointTypes.map(item => {
                        if(Number(item.id) === Number(data.id)) {
                            return {...item, ...data};
                        }
                        return item;
                    })
                }

                state.currentPointTypeId = data.id;
                state.name = data.name;
                state.pluralName = data.plural_name;
                state.selectedAwardHookIds = [];
                state.selectedDeductHookIds = [];
                state.hookSettings = {};

                if (data.requirements && Array.isArray(data.requirements)) {
                    data.requirements.forEach(req => {
                        const key = `${req.action_type}_${req.trigger_key}`;
                        state.hookSettings[key] = req.parameters;
                        if (req.action_type === 'award') {
                            state.selectedAwardHookIds.push(req.trigger_key);
                        } else if (req.action_type === 'deduct') {
                            state.selectedDeductHookIds.push(req.trigger_key);
                        }
                    });
                }
            })

            // --- Fetch List & Delete ---
            .addCase(fetchPointTypes.pending, (state) => {
                state.listStatus = true;
            })
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                state.listStatus = false;
                state.pointTypes = action.payload;
            })
            .addCase(fetchPointTypes.rejected, (state) => {
                state.listStatus = false;
            })
            .addCase(deletePointType.fulfilled, (state, action) => {
                state.pointTypes = state.pointTypes.filter(pt => pt.id !== action.payload);
            });
    },
});

export const {
    updateHookSettings,
    resetStatus
} = pointTypeSlice.actions;

export default pointTypeSlice.reducer;