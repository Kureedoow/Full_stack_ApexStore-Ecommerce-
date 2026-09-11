import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistApi from '../../api/wishlistApi';

const LOCAL_WISHLIST_KEY = 'apex_local_wishlist';

const loadLocalWishlist = () => {
  try {
    const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (items) => {
  try {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.getWishlist();
    return res.data?.products || res.data?.items || res.data || [];
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (product, { getState, rejectWithValue }) => {
    const { auth, wishlist } = getState();
    const productId = product._id || product.id;
    const exists = wishlist.items.some((item) => (item._id || item.id) === productId);

    if (auth.isAuthenticated) {
      try {
        if (exists) {
          await wishlistApi.removeFromWishlist(productId);
          return { action: 'remove', product };
        } else {
          await wishlistApi.addToWishlist(productId);
          return { action: 'add', product };
        }
      } catch (err) {
        return rejectWithValue(err.message || 'Failed to update wishlist');
      }
    }

    // Guest fallback
    return { action: exists ? 'remove' : 'add', product };
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productOrId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const productId = typeof productOrId === 'string' ? productOrId : productOrId._id || productOrId.id;

    if (auth.isAuthenticated) {
      try {
        await wishlistApi.removeFromWishlist(productId);
      } catch (err) {
        return rejectWithValue(err.message || 'Failed to remove from wishlist');
      }
    }

    return productId;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadLocalWishlist(),
    isLoading: false,
    error: null,
  },
  reducers: {
    clearWishlistLocal: (state) => {
      state.items = [];
      localStorage.removeItem(LOCAL_WISHLIST_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        saveLocalWishlist(state.items);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { action: act, product } = action.payload;
        const productId = product._id || product.id;
        if (act === 'remove') {
          state.items = state.items.filter((i) => (i._id || i.id) !== productId);
        } else {
          state.items.push(product);
        }
        saveLocalWishlist(state.items);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const productId = action.payload;
        state.items = state.items.filter((i) => (i._id || i.id) !== productId);
        saveLocalWishlist(state.items);
      });
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
