import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

export const Cart = () => {
  const { items, totals, update, remove, clear, isLoading } = useCart();

  const handleUpdate = async (itemId, newQuantity, productId) => {
    if (newQuantity <= 0) {
      await remove(itemId, productId);
    } else {
      await update(itemId, newQuantity, productId);
    }
  };

  const handleRemove = async (itemId, productId) => {
    await remove(itemId, productId);
  };

  if (!items || items.length === 0) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center shadow-xs">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is completely empty"
            description="Looks like you haven't added any products to your cart yet. Explore our fresh collection and find something you love!"
            action={
              <Link to="/products">
                <Button variant="primary" size="lg" className="mt-4 shadow-lg shadow-indigo-600/20">
                  Start Shopping Now
                </Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const subtotal = totals?.subtotal || items.reduce((acc, item) => {
    const price = item.product?.finalPrice ?? item.product?.price ?? item.price ?? 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const shippingFee = subtotal > 100 ? 0 : 10;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = subtotal + shippingFee + tax;

  return (
    <PageContainer
      title="Shopping Cart"
      subtitle={`You have ${items.length} ${items.length === 1 ? 'unique item' : 'unique items'} in your basket`}
      action={
        <button
          type="button"
          onClick={() => clear()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      }
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs text-left">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <CartItem
                key={item._id || item.product?._id || item.product}
                item={item}
                onUpdateQuantity={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div className="lg:col-span-4 sticky top-24">
          <CartSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            tax={tax}
            discount={0}
            total={total}
            showCheckoutButton={true}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Cart;
