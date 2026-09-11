import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartApi from '../../api/cartApi';

const LOCAL_CART_KEY = 'apex_local_cart';

const loadLocalCart = () => {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    return res.data?.cart || res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const res = await cartApi.addItem(product._id, quantity);
        return { isRemote: true, data: res.data?.cart || res.data };
      } catch (err) {
        return rejectWithValue(err.message || 'Failed to add item to cart');
      }
    }
    // Guest cart
    return {
      isRemote: false,
      item: {
        _id: `guest_${product._id}`,
        product,
        quantity,
        price: product.finalPrice || product.price,
      },
    };
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, productId }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const idToSend = productId || itemId;
    if (auth.isAuthenticated) {
      try {
        const res = await cartApi.updateItem(idToSend, quantity);
        return { isRemote: true, data: res.data?.cart || res.data };
      } catch (err) {
        return rejectWithValue(err.message || 'Failed to update item quantity');
      }
    }
    return { isRemote: false, itemId, productId, quantity };
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async ({ itemId, productId }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const idToSend = productId || itemId;
    if (auth.isAuthenticated) {
      try {
        const res = await cartApi.removeItem(idToSend);
        return { isRemote: true, data: res.data?.cart || res.data };
      } catch (err) {
        return rejectWithValue(err.message || 'Failed to remove item');
      }
    }
    return { isRemote: false, itemId, productId };
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.isAuthenticated) {
    try {
      await cartApi.clearCart();
    } catch {
      // ignore
    }
  }
  localStorage.removeItem(LOCAL_CART_KEY);
  return null;
});

const calculateTotals = (items = []) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.finalPrice || item.product?.price || item.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);
  const shippingFee = subtotal > 100 || items.length === 0 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.max(0, subtotal + shippingFee + tax);

  return { subtotal, shippingFee, tax, total };
};

const initialLocalItems = loadLocalCart();
const initialTotals = calculateTotals(initialLocalItems);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialLocalItems,
    totals: initialTotals,
    isDrawerOpen: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
    resetCart: (state) => {
      state.items = [];
      state.totals = calculateTotals([]);
      localStorage.removeItem(LOCAL_CART_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = action.payload;
        state.items = cart?.items || [];
        const calculated = calculateTotals(state.items);
        state.totals = {
          subtotal: cart?.subtotal !== undefined ? cart.subtotal : calculated.subtotal,
          shippingFee: cart?.shippingFee !== undefined ? cart.shippingFee : calculated.shippingFee,
          tax: calculated.tax,
          total: cart?.totalPrice !== undefined ? cart.totalPrice : calculated.total,
        };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // addToCart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isRemote) {
          const cart = action.payload.data;
          state.items = cart?.items || [];
        } else {
          const { item } = action.payload;
          const existing = state.items.find(
            (i) => (i.product?._id || i.product) === item.product._id
          );
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            state.items.push(item);
          }
          saveLocalCart(state.items);
        }
        state.totals = calculateTotals(state.items);
      })
      // updateCartItem
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.isRemote) {
          const cart = action.payload.data;
          state.items = cart?.items || [];
        } else {
          const { itemId, productId, quantity } = action.payload;
          const item = state.items.find(
            (i) => i._id === itemId || (i.product?._id || i.product) === productId
          );
          if (item) {
            item.quantity = quantity;
          }
          saveLocalCart(state.items);
        }
        state.totals = calculateTotals(state.items);
      })
      // removeCartItem
      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (action.payload.isRemote) {
          const cart = action.payload.data;
          state.items = cart?.items || [];
        } else {
          const { itemId, productId } = action.payload;
          state.items = state.items.filter(
            (i) => i._id !== itemId && (i.product?._id || i.product) !== productId
          );
          saveLocalCart(state.items);
        }
        state.totals = calculateTotals(state.items);
      })
      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totals = calculateTotals([]);
      });
  },
});

export const { toggleCartDrawer, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
