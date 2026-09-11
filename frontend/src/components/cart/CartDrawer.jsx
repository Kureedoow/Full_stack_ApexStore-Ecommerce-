import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { toggleCartDrawer, updateCartItem, removeCartItem } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import CartItem from './CartItem';
import EmptyState from '../common/EmptyState';

export const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, totals, isDrawerOpen } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleClose = () => dispatch(toggleCartDrawer(false));

  const handleUpdate = (itemId, quantity, productId) => {
    dispatch(updateCartItem({ itemId, quantity, productId }));
  };

  const handleRemove = (itemId, productId) => {
    dispatch(removeCartItem({ itemId, productId }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 divide-y divide-slate-100">
            {items.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Explore our curated catalog and find something extraordinary."
                actionLabel="Shop Now"
                onAction={handleClose}
                actionLink="/products"
              />
            ) : (
              items.map((item) => (
                <CartItem
                  key={item._id || item.product?._id}
                  item={item}
                  onUpdateQuantity={handleUpdate}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-slate-600 font-medium">Estimated Subtotal</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(totals?.subtotal || 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Taxes and shipping calculated at checkout
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/cart"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs text-center transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 transition-colors"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
