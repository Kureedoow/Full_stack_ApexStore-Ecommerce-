import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productApi from '../../api/productApi';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // axios interceptor returns response.data, so res = { success, message, data: [...], pagination: {...} }
      const res = await productApi.getProducts(params);
      return res; // return the full object so slice can read both data and pagination
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      // res = { success, message, data: [...] }
      const res = await productApi.getFeaturedProducts();
      const items = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      return items;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load featured products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      // res = { success, message, data: product }
      const res = await productApi.getProductById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Product not found');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      // res = { success, message, data: product }
      const res = await productApi.getProductBySlug(slug);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Product not found');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    currentProduct: null,
    pagination: {
      page: 1,
      limit: 12,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      inStock: false,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        inStock: false,
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload = { success, message, data: [...products], pagination: {...} }
        const payload = action.payload;
        const pag = payload.pagination || {};
        state.items = Array.isArray(payload.data) ? payload.data : [];
        state.pagination = {
          page: pag.page || 1,
          limit: pag.limit || 12,
          totalPages: pag.totalPages || 1,
          totalCount: pag.totalItems || state.items.length,
          hasNextPage: pag.hasNextPage || false,
          hasPrevPage: pag.hasPreviousPage || false,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = Array.isArray(action.payload) ? action.payload : [];
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchProductBySlug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
