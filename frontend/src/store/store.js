import { configureStore } from '@reduxjs/toolkit';
import authReducer, { forceLogout } from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    categories: categoryReducer,
  },
  devTools: import.meta.env.DEV,
});

// Listen for custom auth:expired event from Axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:expired', () => {
    store.dispatch(forceLogout());
  });
}

export default store;
