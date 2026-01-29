import { API, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- 1. Fetch Available Triggers (Modular API) ---
export const fetchTriggers = createAsyncThunk(
    'gameengine/fetchTriggers',
    async (scope = 'point_type', { rejectWithValue }) => {
        try {
            const res = await API.get(`${namespace}triggers?scope=${scope}`);
            return res?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. Fetch Dynamic Options (Zaplane Style) ---
export const fetchDynamicOptions = createAsyncThunk(
    'gameengine/fetchDynamicOptions',
    async ({ integration, query }, { rejectWithValue }) => {
        try {
            const res = await API.post(`${namespace}dynamic`, { integration, query });
            return res?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 3. Save Point Type (Create) ---
export const savePointType = createAsyncThunk('gameengine/savePointType', async (pointData, { rejectWithValue }) => {
    try {
        const res = await API.post(`${namespace}point-types`, pointData);
        return {...pointData, id: res?.data.id};
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// --- 4. Update Point Type (Edit) ---
export const updatePointType = createAsyncThunk(
    'gameengine/updatePointType',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            await API.put(`${namespace}point-types/${id}`, data);
            return { id, ...data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 5. Fetch Single Point Type by ID ---
export const fetchPointTypeById = createAsyncThunk(
    'gameengine/fetchPointTypeById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.get(`${namespace}point-types/${id}`);
            return res?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 6. Fetch All Point Types (List) ---
export const fetchPointTypes = createAsyncThunk(
    'gameengine/fetchPointTypes',
    async ({status = 'all', page = 1, per_page= 15, search= ""}, { rejectWithValue }) => {
        let params = {
            status: status === 'all' ? 'any' : status,
            page,
            per_page,
        };
        if (search) params = { ...params, search };
        try {
            const response = await API.get(`${namespace}point-types`, {params});

            return {
                data: response.data,
                ...params,
                total: parseInt(response.headers['x-wp-total']),
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 7. Delete Point Type ---
export const deletePointType = createAsyncThunk(
    'gameengine/deletePointType',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`${namespace}point-types/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    pointTypes: [],
    integrations: {},
    allHooks: [],
    hookSettings: {},
    status: 'idle',
    listStatus: false,
    saveStatus: 'idle',
    error: null,
    status: 'all',
    page: 1,
    perPage: 15,
    search: '',
    total: '',
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
        },
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

            // --- Save ---
            .addCase(savePointType.fulfilled, (state, {payload}) => {
                state.pointTypes = [payload,...state.pointTypes]
            })

            // --- Update ---
            .addCase(updatePointType.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.pointTypes.findIndex(pt => Number(pt.id) === Number(updated.id));
                if (idx !== -1) {
                    state.pointTypes[idx] = { ...state.pointTypes[idx], ...updated };
                }
            })

            // --- Fetch Single by ID ---
            .addCase(fetchPointTypeById.fulfilled, (state, action) => {
                const data = action.payload;
                const existingIndex = state.pointTypes.findIndex(pt => Number(pt.id) === Number(data.id));
                
                if (existingIndex !== -1) {
                    // Update existing item
                    state.pointTypes[existingIndex] = { ...state.pointTypes[existingIndex], ...data };
                } else {
                    // Add new item if not present
                    state.pointTypes.unshift(data);
                }

                state.currentPointTypeId = data.id;

                state.hookSettings = {};
                if (Array.isArray(data.requirements)) {
                    data.requirements.forEach(req => {
                        const key = `${req.action_type}_${req.trigger_key}`;
                        state.hookSettings[key] = req.parameters || {};
                    });
                }
            })

            // --- Fetch List ---
            .addCase(fetchPointTypes.pending, (state) => {
                state.listStatus = true;
            })
            .addCase(fetchPointTypes.fulfilled, (state, action) => {
                const {data, page, per_page, total, search} = action.payload;
                state.listStatus = false;
                // Replace the entire list with fresh data from server
                state.pointTypes = data;
                state.page = page;
                state.perPage = per_page;
                state.total = total;
                state.search = search;
            })
            .addCase(fetchPointTypes.rejected, (state) => {
                state.listStatus = false;
            })

            // --- Delete ---
            .addCase(deletePointType.fulfilled, (state, action) => {
                state.pointTypes = state.pointTypes.filter(pt => pt.id !== action.payload);
            });
    },
});

export const {
    updateHookSettings,
    resetStatus,
} = pointTypeSlice.actions;

export default pointTypeSlice.reducer;
