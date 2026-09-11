import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryApi from '../../api/categoryApi';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    // axios interceptor returns response.data = { success, message, data: [...categories] }
    const res = await categoryApi.getCategories();
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch categories');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
