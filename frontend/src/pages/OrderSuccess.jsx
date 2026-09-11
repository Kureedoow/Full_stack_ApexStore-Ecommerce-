import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import formatCurrency from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  const orderId = location.state?.orderId || order?._id;

  if (!orderId && !order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center space-y-8">
        {/* Animated celebration icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thank You! Your Order is Confirmed!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We've received your order and our fulfillment team is now preparing it for shipment.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-6 text-left space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Order Number
            </span>
            <span className="font-mono text-xs font-bold text-indigo-600">
              #{orderId?.slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Order Date</span>
            <span className="text-xs font-semibold text-slate-800">
              {formatDate(order?.createdAt || new Date())}
            </span>
          </div>

          {order?.totalPrice !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total Paid</span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          )}

          {order?.paymentMethod && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Payment Method</span>
              <span className="text-xs font-semibold text-slate-800 capitalize">
                {order.paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {order?.shippingAddress && (
            <div className="pt-3 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Delivering To
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {orderId && (
            <Link to={`/orders/${orderId}`} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Package className="w-4 h-4" />}
                className="w-full shadow-md shadow-indigo-600/20"
              >
                Track Order
              </Button>
            </Link>
          )}

          <Link to="/products" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default OrderSuccess;
