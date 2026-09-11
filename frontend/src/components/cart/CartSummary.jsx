import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartSummary = ({
  subtotal = 0,
  shippingFee = 0,
  tax = 0,
  discount = 0,
  total = 0,
  showCheckoutButton = true,
}) => {
  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-sm text-left">
      <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
        Order Summary
      </h3>

      {/* Free Shipping Progress Indicator */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1.5">
          <Truck className="w-4 h-4 text-indigo-600" />
          {amountNeeded > 0 ? (
            <span>
              Add <strong className="text-indigo-600">{formatCurrency(amountNeeded)}</strong> more to unlock FREE Delivery
            </span>
          ) : (
            <span className="text-emerald-700 font-bold">🎉 You qualify for FREE Delivery!</span>
          )}
        </div>
        <div className="w-full h-1.5 bg-indigo-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Coupon Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Estimated Shipping</span>
          <span className="font-semibold text-slate-900">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Estimated Sales Tax</span>
          <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
          <span>Estimated Total</span>
          <span className="text-xl text-indigo-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      {showCheckoutButton && (
        <Link
          to="/checkout"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-[0.98] transition-all"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* Security Note */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Guaranteed safe & secure checkout</span>
      </div>
    </div>
  );
};

export default CartSummary;
