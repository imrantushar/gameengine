import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// --- Async Thunks ---
export const fetchAchievementTypes = createAsyncThunk('gameengine/fetchAchievementTypes', async (_, thunkAPI) => {
  try {
    const response = await API.get(namespace + 'taxonomies/achievement_type');
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});


export const fetchAchievementTypeById = createAsyncThunk('gameengine/fetchAchievementTypeById', async (id) => {
  try{
    const response =  await API.get(namespace + 'taxonomies/achievement_type/' + id);
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const createAchievementType = createAsyncThunk('gameengine/createAchievementType', async (data, thunkAPI) => {
  try {
    const response =  await API.post(namespace + 'taxonomies/achievement_type', {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type created successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
    return {id: response.data.term_id, ...data};
  } catch (error) {
      return handleSliceError(thunkAPI, error)
  }
});

export const updateAchievementType = createAsyncThunk('gameengine/updateAchievementType', async ({ id, data }, thunkAPI) => {
  try{
    const response =  await API.post(namespace + 'taxonomies/achievement_type/' + id, {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type updated successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
    return {id: response.data.term_id, ...data};
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const deleteAchievementType = createAsyncThunk('gameengine/deleteAchievementType', async (id, thunkAPI) => {
  try{
    await API.post(namespace + 'taxonomies/achievement_type/' + id,
      { force: true },
      {
        headers: {
            'X-HTTP-Method-Override': 'DELETE',
        },
      }
    );
  
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type deleted successfully.', 'gameengine'),
      isShow: true,
      type: 'success',
    }))
  
    return id;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});
