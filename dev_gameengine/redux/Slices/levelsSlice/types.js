import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// --- Async Thunks ---
export const fetchLevelTypes = createAsyncThunk('gameengine/fetchLevelTypes', async (_, thunkAPI) => {
  try {
    const response = await API.get(namespace + 'taxonomies/gameengine_level_type');
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});


export const fetchLevelTypeById = createAsyncThunk('gameengine/fetchLevelTypeById', async (id) => {
  try{
    const response =  await API.get(namespace + 'taxonomies/gameengine_level_type/' + id);
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const createLevelType = createAsyncThunk('gameengine/createLevelType', async (data, thunkAPI) => {
  try {
    const response =  await API.post(namespace + 'taxonomies/gameengine_level_type', {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Level type created successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
    return {id: response.data.term_id, ...data};
  } catch (error) {
      return handleSliceError(thunkAPI, error)
  }
});

export const updateLevelType = createAsyncThunk('gameengine/updateLevelType', async ({ id, data }, thunkAPI) => {
  try{
    const response =  await API.post(namespace + 'taxonomies/gameengine_level_type/' + id, {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Level type updated successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
    return  {id: response.data.term_id, ...data};
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const deleteLevelType = createAsyncThunk('gameengine/deleteLevelType', async (id, thunkAPI) => {
  try{
    await API.post(namespace + 'taxonomies/gameengine_level_type/' + id,
      { force: true },
      {
        headers: {
            'X-HTTP-Method-Override': 'DELETE',
        },
      }
    );
  
    thunkAPI.dispatch(showNotification({
      message: __('Level type deleted successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
  
    return id;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});
