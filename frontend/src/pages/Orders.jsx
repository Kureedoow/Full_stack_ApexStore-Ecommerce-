import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ShoppingBag } from 'lucide-react';
import { fetchMyOrders, cancelOrder } from '../store/slices/orderSlice';
import OrderCard from '../components/orders/OrderCard';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export const Orders = () => {
  const dispatch = useDispatch();
  const { items: orders, pagination, isLoading } = useSelector((state) => state.orders);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleOpenCancel = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;
    setIsCancelling(true);
    try {
      const res = await dispatch(
        cancelOrder({ id: selectedOrderId, reason: cancelReason })
      );
      if (cancelOrder.fulfilled.match(res)) {
        toast.success('Order has been cancelled.');
        setCancelModalOpen(false);
        dispatch(fetchMyOrders({ page: pagination.page || 1, limit: 10 }));
      } else {
        toast.error(res.payload || 'Failed to cancel order');
      }
    } catch {
      toast.error('Could not cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchMyOrders({ page: newPage, limit: 10 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer
      title="My Orders"
      subtitle="View your purchase history and track ongoing shipments"
      maxWidth="max-w-5xl"
    >
      {isLoading ? (
        <Loader message="Loading your orders..." />
      ) : !orders || orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center shadow-xs">
          <EmptyState
            icon={Package}
            title="No orders placed yet"
            description="You haven't placed any orders with us yet. Discover something unique in our catalog!"
            action={
              <Link to="/products">
                <Button variant="primary" size="lg" className="mt-4 shadow-lg shadow-indigo-600/20">
                  Start Shopping
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={() => handleOpenCancel(order._id)}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="pt-8 flex justify-center border-t border-slate-100">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this order? This action cannot be reversed.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, found better price, entered wrong address..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Orders;
