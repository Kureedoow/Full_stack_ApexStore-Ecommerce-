import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronRight, CreditCard } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import formatCurrency from '../../utils/formatCurrency';
import getImageUrl from '../../utils/getImageUrl';
import OrderStatus from './OrderStatus';

export const OrderCard = ({ order, onCancel }) => {
  if (!order) return null;

  const itemsCount = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus?.toLowerCase());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-left">
      {/* Card Header */}
      <div className="bg-slate-50/70 p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-xs font-bold text-slate-900">
              #{order._id?.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrderStatus status={order.orderStatus} />
        </div>
      </div>

      {/* Card Body: Items Preview */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {order.orderItems?.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200/70 overflow-hidden shrink-0 group"
              title={item.title}
            >
              <img
                src={getImageUrl(item.image || item.product?.thumbnail)}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/100x100?text=Item';
                }}
              />
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  ×{item.quantity}
                </span>
              )}
            </div>
          ))}

          {order.orderItems?.length > 4 && (
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
              +{order.orderItems.length - 4}
            </div>
          )}

          <div className="pl-2">
            <p className="text-xs font-semibold text-slate-800">
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <CreditCard className="w-3 h-3" />
              <span className="capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Total & Action */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(order._id)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}

            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
