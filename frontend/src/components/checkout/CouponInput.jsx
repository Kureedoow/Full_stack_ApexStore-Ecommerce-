import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import couponApi from '../../api/couponApi';
import Button from '../common/Button';

export const CouponInput = ({
  orderAmount = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e?.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await couponApi.validateCoupon(cleanCode, orderAmount);
      const couponData = res.data?.coupon || res.data?.data || res.data;
      onApplyCoupon({
        code: cleanCode,
        discountPercentage: couponData.discountPercentage || 0,
        discountAmount: couponData.discountAmount || (couponData.discountPercentage ? (orderAmount * couponData.discountPercentage) / 100 : 0),
        ...couponData,
      });
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired coupon code');
    } finally {
      setIsLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-emerald-800 tracking-wide">
                {appliedCoupon.code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                Applied
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-0.5">
              Coupon discount applied to your order
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemoveCoupon}
          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-200/60 transition-colors"
          title="Remove coupon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Have a promo code?
      </label>
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError('');
            }}
            placeholder="e.g. SUMMER25"
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 uppercase transition-all"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="md"
          isLoading={isLoading}
          disabled={!code.trim() || isLoading}
          className="shrink-0"
        >
          Apply
        </Button>
      </form>
      {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
    </div>
  );
};

export default CouponInput;
