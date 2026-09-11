import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  toggleCartDrawer,
} from '../store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totals, isDrawerOpen, isLoading, error } = useSelector((state) => state.cart);

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const add = (product, quantity = 1) => dispatch(addToCart({ product, quantity })).unwrap();
  const update = (itemId, quantity, productId) =>
    dispatch(updateCartItem({ itemId, quantity, productId })).unwrap();
  const remove = (itemId, productId) => dispatch(removeCartItem({ itemId, productId })).unwrap();
  const clear = () => dispatch(clearCart()).unwrap();
  const toggleDrawer = (open) => dispatch(toggleCartDrawer(open));

  const isInCart = (productId) =>
    items.some((item) => (item.product?._id || item.product) === productId);

  return {
    items,
    totals,
    itemCount,
    isDrawerOpen,
    isLoading,
    error,
    add,
    update,
    remove,
    clear,
    toggleDrawer,
    isInCart,
  };
};

export default useCart;
