import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

// --- 1. Fetch Available Triggers (Modular API) ---
export const fetchTriggers = createAsyncThunk(
    'pointType/fetchTriggers',
    async (_, { rejectWithValue }) => {
        try {
            // এখন এটি সব ইন্টিগ্রেশন এবং ট্রিগার নিয়ে আসবে
            return await apiFetch({ path: '/gamify/v1/triggers' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. Fetch Dynamic Options (Zaplane Style) ---
export const fetchDynamicOptions = createAsyncThunk(
    'pointType/fetchDynamicOptions',
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
    'pointType/save',
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
    'pointType/update',
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
    'pointType/fetchById',
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
    'pointType/fetchAll',
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
    'pointType/delete',
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
    listStatus: 'idle',
    saveStatus: 'idle',
    error: null,
};

const pointTypeSlice = createSlice({
    name: 'pointType',
    initialState,
    reducers: {
        setPointName: (state, action) => { state.name = action.payload; },
        setPluralName: (state, action) => { state.pluralName = action.payload; },
        resetPointTypeForm: (state) => {
            state.currentPointTypeId = null;
            state.name = '';
            state.pluralName = '';
            state.selectedAwardHookIds = [];
            state.selectedDeductHookIds = [];
            state.hookSettings = {};
            state.saveStatus = 'idle';
            state.error = null;
        },
        addAwardHook: (state, action) => {
            if (!state.selectedAwardHookIds.includes(action.payload)) {
                state.selectedAwardHookIds.push(action.payload);
            }
        },
        removeAwardHook: (state, action) => {
            state.selectedAwardHookIds = state.selectedAwardHookIds.filter(id => id !== action.payload);
        },
        addDeductHook: (state, action) => {
            if (!state.selectedDeductHookIds.includes(action.payload)) {
                state.selectedDeductHookIds.push(action.payload);
            }
        },
        removeDeductHook: (state, action) => {
            state.selectedDeductHookIds = state.selectedDeductHookIds.filter(id => id !== action.payload);
        },
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
            // --- Fetch Triggers (Handled correctly without duplicates) ---
            .addCase(fetchTriggers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTriggers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.integrations = action.payload;

                // Flatten object into array for allHooks compatibility
                const flattenedHooks = [];
                Object.keys(action.payload).forEach(slug => {
                    const integration = action.payload[slug];
                    Object.keys(integration.triggers).forEach(triggerKey => {
                        flattenedHooks.push({
                            id: triggerKey,
                            integrationSlug: slug,
                            ...integration.triggers[triggerKey]
                        });
                    });
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
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                state.listStatus = 'succeeded';
                state.pointTypes = action.payload;
            })
            .addCase(deletePointType.fulfilled, (state, action) => {
                state.pointTypes = state.pointTypes.filter(pt => pt.id !== action.payload);
            });
    },
});

export const {
    setPointName, setPluralName, resetPointTypeForm,
    addAwardHook, removeAwardHook,
    addDeductHook, removeDeductHook,
    updateHookSettings,
    resetStatus
} = pointTypeSlice.actions;

export default pointTypeSlice.reducer;