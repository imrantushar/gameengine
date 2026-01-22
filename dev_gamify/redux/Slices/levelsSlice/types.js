import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// --- Async Thunks ---
export const fetchLevelTypes = createAsyncThunk('gamify/fetchLevelTypes', async (_, thunkAPI) => {
  try {
    const response = await API.get(namespace + 'level_type');
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});


export const fetchLevelTypeById = createAsyncThunk('gamify/fetchLevelTypeById', async (id) => {
  try{
    const response =  await API.get(namespace + 'level_type/' + id);
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const createLevelType = createAsyncThunk('gamify/createLevelType', async (data, thunkAPI) => {
  try {
    const response =  await API.post(namespace + 'level_type', {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Level type created successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
    return response.data;
  } catch (error) {
      return handleSliceError(thunkAPI, error)
  }
});

export const updateLevelType = createAsyncThunk('gamify/updateLevelType', async ({ id, data }, thunkAPI) => {
  try{
    const response =  await API.post(namespace + 'level_type/' + id, {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Level type updated successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const deleteLevelType = createAsyncThunk('gamify/deleteLevelType', async (id, thunkAPI) => {
  try{
    await API.post(namespace + 'level_type/' + id,
      { force: false },
      {
        headers: {
            'X-HTTP-Method-Override': 'DELETE',
        },
      }
    );
  
    thunkAPI.dispatch(showNotification({
      message: __('Level type deleted successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
  
    return id;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});
