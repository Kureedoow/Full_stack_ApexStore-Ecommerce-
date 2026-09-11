import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FileText, AlertCircle } from 'lucide-react';
import { AddressSelector } from './AddressSelector';
import { PaymentMethod } from './PaymentMethod';
import { OrderSummary } from './OrderSummary';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';

export const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const cartState = useSelector((state) => state.cart || {});
  const items = cartState.items || [];
  const summary = cartState.totals || cartState.summary || {
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
  };

  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null
  );
  const [isEnteringNew, setIsEnteringNew] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleNewAddressChange = (field, value) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountAmount) return appliedCoupon.discountAmount;
    if (appliedCoupon.discountPercentage) {
      return ((summary?.subtotal || 0) * appliedCoupon.discountPercentage) / 100;
    }
    return 0;
  };

  const subtotalVal = summary?.subtotal || 0;
  const discountVal = calculateDiscount();
  const shippingVal = subtotalVal > 100 || items.length === 0 ? 0 : (summary?.shippingFee || 9.99);
  const taxVal = summary?.tax || Number((Math.max(0, subtotalVal - discountVal) * 0.08).toFixed(2));
  const finalTotal = Math.max(0, subtotalVal - discountVal + shippingVal + taxVal);

  const handlePlaceOrder = async () => {
    setFormError('');

    // Determine final address payload
    let finalAddress = null;
    if (isEnteringNew) {
      if (
        !newAddress.fullName?.trim() ||
        !newAddress.addressLine1?.trim() ||
        !newAddress.city?.trim() ||
        !newAddress.state?.trim() ||
        !newAddress.postalCode?.trim()
      ) {
        setFormError('Please fill in all required shipping address fields (Full Name, Address, City, State, and Postal Code).');
        toast.error('Please complete shipping details');
        return;
      }
      finalAddress = {
        fullName: newAddress.fullName.trim(),
        phone: (newAddress.phone || user?.phone || '').trim(),
        addressLine1: newAddress.addressLine1.trim(),
        addressLine2: (newAddress.addressLine2 || '').trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        postalCode: newAddress.postalCode.trim(),
        country: (newAddress.country || 'United States').trim(),
      };
    } else {
      if (!selectedAddress) {
        setFormError('Please select or enter a shipping address.');
        toast.error('Please select shipping address');
        return;
      }
      finalAddress = {
        fullName: (selectedAddress.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`).trim(),
        phone: (selectedAddress.phone || user?.phone || '').trim(),
        addressLine1: (selectedAddress.addressLine1 || '').trim(),
        addressLine2: (selectedAddress.addressLine2 || '').trim(),
        city: (selectedAddress.city || '').trim(),
        state: (selectedAddress.state || '').trim(),
        postalCode: (selectedAddress.postalCode || '').trim(),
        country: (selectedAddress.country || 'United States').trim(),
      };
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        shippingAddress: finalAddress,
        paymentMethod: paymentMethod || 'card',
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
        ...(notes && notes.trim() ? { notes: notes.trim() } : {}),
      };

      const resultAction = await dispatch(createOrder(orderPayload));

      if (createOrder.fulfilled.match(resultAction)) {
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        const createdOrder = resultAction.payload;
        navigate('/order-success', {
          state: {
            order: createdOrder,
            orderId: createdOrder?._id,
          },
          replace: true,
        });
      } else {
        const errMsg = resultAction.payload || 'Failed to place order';
        setFormError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred during checkout.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Checkout Form Inputs */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <p className="font-medium">{formError}</p>
          </div>
        )}

        <AddressSelector
          addresses={user?.addresses || []}
          selectedAddress={selectedAddress}
          onSelectAddress={(addr) => {
            setSelectedAddress(addr);
            setIsEnteringNew(false);
            if (formError) setFormError('');
          }}
          newAddress={newAddress}
          onNewAddressChange={handleNewAddressChange}
          isEnteringNew={isEnteringNew}
          setIsEnteringNew={setIsEnteringNew}
        />

        <PaymentMethod
          selectedMethod={paymentMethod}
          onSelectMethod={(method) => setPaymentMethod(method)}
        />

        {/* Order Notes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 text-left">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Order Notes (Optional)</h3>
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions for delivery, gate code, or gift note..."
            maxLength={500}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-400 text-right">{notes.length}/500</p>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
        <OrderSummary
          items={items}
          subtotal={subtotalVal}
          discount={discountVal}
          shippingFee={shippingVal}
          tax={taxVal}
          totalPrice={finalTotal}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
          onRemoveCoupon={() => setAppliedCoupon(null)}
          isSubmitting={isSubmitting}
          onPlaceOrder={handlePlaceOrder}
          buttonText="Confirm & Place Order"
        />
      </div>
    </div>
  );
};

export default CheckoutForm;
