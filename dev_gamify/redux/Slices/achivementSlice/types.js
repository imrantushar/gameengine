import { API, handleSliceError, namespace } from '@GFUtils/helper';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// --- Async Thunks ---
export const fetchAchievementTypes = createAsyncThunk('gamify/fetchAchievementTypes', async (_, thunkAPI) => {
  try {
    const response = await API.get(namespace + 'taxonomies/achievement_type');
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});


export const fetchAchievementTypeById = createAsyncThunk('gamify/fetchAchievementTypeById', async (id) => {
  try{
    const response =  await API.get(namespace + 'taxonomies/achievement_type/' + id);
    return response.data;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const createAchievementType = createAsyncThunk('gamify/createAchievementType', async (data, thunkAPI) => {
  try {
    const response =  await API.post(namespace + 'taxonomies/achievement_type', {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type created successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
    return {id: response.data.term_id, ...data};
  } catch (error) {
      return handleSliceError(thunkAPI, error)
  }
});

export const updateAchievementType = createAsyncThunk('gamify/updateAchievementType', async ({ id, data }, thunkAPI) => {
  try{
    const response =  await API.post(namespace + 'taxonomies/achievement_type/' + id, {
        ...data
    });
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type updated successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
    return {id: response.data.term_id, ...data};
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});

export const deleteAchievementType = createAsyncThunk('gamify/deleteAchievementType', async (id, thunkAPI) => {
  try{
    await API.post(namespace + 'taxonomies/achievement_type/' + id,
      { force: false },
      {
        headers: {
            'X-HTTP-Method-Override': 'DELETE',
        },
      }
    );
  
    thunkAPI.dispatch(showNotification({
      message: __('Achievement type deleted successfully.', 'gamify'),
      isShow: true,
      type: 'success',
    }))
  
    return id;
  } catch (error) {
    return handleSliceError(thunkAPI, error)
  }
});
