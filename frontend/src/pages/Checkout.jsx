import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import useCart from '../hooks/useCart';
import CheckoutForm from '../components/checkout/CheckoutForm';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

export const Checkout = () => {
  const { items } = useCart();

  if (!items || items.length === 0) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center shadow-xs">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="You cannot proceed to checkout without any products in your cart. Choose from our great selection first!"
            action={
              <Link to="/products">
                <Button variant="primary" size="lg" className="mt-4 shadow-lg shadow-indigo-600/20">
                  Shop Products
                </Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Complete Your Order"
      subtitle="Enter your delivery destination and preferred payment method"
      action={
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      }
      maxWidth="max-w-7xl"
    >
      <CheckoutForm />
    </PageContainer>
  );
};

export default Checkout;
