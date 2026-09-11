import React from 'react';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import getImageUrl from '../../utils/getImageUrl';
import Button from '../common/Button';
import CouponInput from './CouponInput';

export const OrderSummary = ({
  items = [],
  subtotal = 0,
  discount = 0,
  shippingFee = 0,
  tax = 0,
  totalPrice = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  isSubmitting = false,
  onPlaceOrder,
  disabled = false,
  buttonText = 'Place Order',
  showCoupon = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
        </span>
      </div>

      {/* Item List preview */}
      {items.length > 0 && (
        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
          {items.map((item, idx) => {
            const product = item.product || item;
            const price = item.price ?? product.finalPrice ?? product.price ?? 0;
            const title = product.title || item.title || 'Product';
            const img = getImageUrl(product.thumbnail || product.images?.[0] || item.image);

            return (
              <div key={item._id || item.product?._id || idx} className="flex items-center gap-3 pt-3 first:pt-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100?text=Item';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Qty: {item.quantity} × {formatCurrency(price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(price * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coupon input */}
      {showCoupon && (
        <div className="pt-3 border-t border-slate-100">
          <CouponInput
            orderAmount={subtotal}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />
        </div>
      )}

      {/* Price breakdown */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
            <span className="font-semibold">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-semibold text-slate-900">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 uppercase font-bold text-[11px]">Free</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <span className="text-sm font-bold text-slate-900">Total</span>
          <span className="text-xl font-extrabold text-indigo-600">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Place Order CTA */}
      {onPlaceOrder && (
        <Button
          type="button"
          onClick={onPlaceOrder}
          disabled={disabled || isSubmitting}
          isLoading={isSubmitting}
          size="lg"
          className="w-full shadow-lg shadow-indigo-600/20"
        >
          {buttonText}
        </Button>
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Guaranteed safe & secure checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;
