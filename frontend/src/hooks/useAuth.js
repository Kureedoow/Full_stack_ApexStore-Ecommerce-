import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, checkAuth, clearAuthError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginUser(credentials)).unwrap();
  const register = (userData) => dispatch(registerUser(userData)).unwrap();
  const logout = () => dispatch(logoutUser()).unwrap();
  const refreshMe = () => dispatch(checkAuth()).unwrap();
  const clearError = () => dispatch(clearAuthError());

  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    login,
    register,
    logout,
    refreshMe,
    clearError,
  };
};

export default useAuth;
