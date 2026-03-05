import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { menu, API, namespace } from '@GFUtils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';

export const fetchAdminMenuItems = createAsyncThunk(
	'gameengine/fetchAdminMenuItems',
	async (_, thunkAPI) => {
		try {
			return await API.get(`${namespace}menus`)
				.then((res) => {
					console.log({res});
					return res?.data;
				});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

const menuSlice = createSlice({
	name: 'menus',
	initialState: {
		data: JSON.parse(menu),
		loading: false,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAdminMenuItems.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAdminMenuItems.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(fetchAdminMenuItems.rejected, (state) => {
				state.loading = false;
			});
	},
});

export default menuSlice.reducer;
