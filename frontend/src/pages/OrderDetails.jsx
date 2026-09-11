import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { fetchOrderById, cancelOrder } from '../store/slices/orderSlice';
import useAuth from '../hooks/useAuth';
import adminApi from '../api/adminApi';
import OrderStatus from '../components/orders/OrderStatus';
import OrderItem from '../components/orders/OrderItem';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import formatCurrency from '../utils/formatCurrency';
import { formatDate, formatDateTime } from '../utils/formatDate';
import toast from 'react-hot-toast';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();

  const { currentOrder: order, isLoading, error } = useSelector((state) => state.orders);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!isAdmin || !order?._id) return;
    setIsUpdatingStatus(true);
    try {
      await adminApi.updateOrderStatus(order._id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchOrderById(id));
    } catch (err) {
      toast.error(err?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await dispatch(cancelOrder({ id: order._id, reason: cancelReason }));
      if (cancelOrder.fulfilled.match(res)) {
        toast.success('Order cancelled successfully');
        setCancelModalOpen(false);
      } else {
        toast.error(res.payload || 'Failed to cancel');
      }
    } catch {
      toast.error('Could not cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <Loader message="Retrieving order details..." />;
  }

  if (error || !order) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <ErrorMessage
          title="Order Not Found"
          message={error || 'We could not find the requested order in your account.'}
          action={
            <Link to={isAdmin ? '/admin/orders' : '/orders'}>
              <Button variant="primary">Return to Orders</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus?.toLowerCase());
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus?.toLowerCase());

  return (
    <PageContainer
      title={`Order #${order._id?.slice(-8).toUpperCase()}`}
      subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
      action={
        <div className="flex items-center gap-3">
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          <Link to={isAdmin ? '/admin/orders' : '/orders'}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Orders
            </Button>
          </Link>
        </div>
      }
      maxWidth="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Status Stepper Banner */}
        {order.orderStatus?.toLowerCase() !== 'cancelled' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Delivery Status</h3>
              </div>
              <OrderStatus status={order.orderStatus} size="lg" />
            </div>

            {/* Stepper tracker */}
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step}
                    className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs capitalize ${
                        isCurrent
                          ? 'font-bold text-indigo-600'
                          : isPassed
                          ? 'font-semibold text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center gap-3 text-rose-800">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs text-rose-600 mt-0.5">
                This order was cancelled. Any authorized charges will be refunded.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Items */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Ordered Items ({order.orderItems?.length || 0})
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {order.orderItems?.map((item, idx) => (
                <OrderItem key={item._id || idx} item={item} />
              ))}
            </div>

            {order.notes && (
              <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Customer Notes:</span>
                  <p className="mt-0.5">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Admin Management, Customer Info, Address, Payment & Totals */}
          <div className="lg:col-span-4 space-y-6 text-left">
            {/* Admin Order Status Manager */}
            {isAdmin && (
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-indigo-100">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Admin Status Controls
                  </h4>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Change Order Status:
                  </label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}

            {/* Customer Details (Visible for Admin) */}
            {order.user && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Customer Account
                  </h4>
                </div>
                <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <p className="font-bold text-slate-900 text-sm">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-indigo-600 font-medium">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-slate-400 font-mono">Tel: {order.user.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Shipping Address
                </h4>
              </div>
              {order.shippingAddress ? (
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                  <p className="mt-1">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2 text-slate-400 font-mono">Phone: {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No address recorded</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Details
                </h4>
              </div>
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {order.paymentMethod?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-bold text-indigo-600 capitalize">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Price Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.subtotal || 0)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-slate-900">
                    {order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee || 0)}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Paid</span>
                  <span className="text-xl font-extrabold text-indigo-600">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Please let us know why you are cancelling this order:
          </p>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Dismiss
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default OrderDetails;
