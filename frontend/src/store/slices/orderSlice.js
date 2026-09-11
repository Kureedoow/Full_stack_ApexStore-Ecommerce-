import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderApi from '../../api/orderApi';

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const res = await orderApi.createOrder(orderData);
    return res.data?.order || res.data;
  } catch (err) {
    const msg =
      err.data?.error?.details?.map((d) => d.message).join(', ') ||
      err.data?.message ||
      err.message ||
      'Failed to place order';
    return rejectWithValue(msg);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await orderApi.getMyOrders(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch orders');
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const res = await orderApi.getOrderById(id);
    return res.data?.order || res.data;
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch order details');
  }
});

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await orderApi.cancelOrder(id, reason);
      return res.data?.order || res.data;
    } catch (err) {
      return rejectWithValue(err.data?.message || err.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalCount: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchMyOrders
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.items = data.orders || data.items || (Array.isArray(data) ? data : []);
        if (data.pagination) {
          state.pagination = data.pagination;
        }
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // cancelOrder
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.items = state.items.map((o) => (o._id === action.payload._id ? action.payload : o));
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
