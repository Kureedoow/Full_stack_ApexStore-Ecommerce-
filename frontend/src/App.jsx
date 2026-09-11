import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { checkAuth } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './ErrorBoundary';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial session verification & cart restoration
    dispatch(checkAuth());
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
