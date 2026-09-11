import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, CheckCircle2 } from 'lucide-react';
import adminApi from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import OrderStatus from '../../components/orders/OrderStatus';
import formatCurrency from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getOrders({
        page,
        limit: 10,
        ...(statusFilter && { orderStatus: statusFilter }),
        ...(search && { search }),
      });
      const data = res.data?.data || res.data;
      setOrders(data.orders || data.items || (Array.isArray(data) ? data : []));
      setTotalPages(data.pagination?.totalPages || data.pages || 1);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const columns = [
    {
      key: '_id',
      header: 'Order Ref',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          #{row._id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Customer',
      render: (row) => (
        <div>
          <span className="block text-xs font-bold text-slate-900">
            {row.user?.firstName} {row.user?.lastName}
          </span>
          <span className="block text-[11px] font-mono text-slate-400 truncate max-w-[160px]">
            {row.user?.email || 'Guest'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900">
          {formatCurrency(row.totalPrice)}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) => (
        <div>
          <span className="block text-xs font-semibold text-slate-700 capitalize">
            {row.paymentMethod?.replace(/_/g, ' ')}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              row.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {row.paymentStatus}
          </span>
        </div>
      ),
    },
    {
      key: 'orderStatus',
      header: 'Fulfillment Status',
      render: (row) => (
        <select
          value={row.orderStatus}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs capitalize"
        >
          {Object.values(ORDER_STATUS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Link
          to={`/orders/${row._id}`}
          className="p-1.5 rounded-lg inline-flex items-center text-indigo-600 hover:bg-indigo-50 font-semibold text-xs"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminLayout title="Orders Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Store Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer orders, transition fulfillment statuses, and verify payments
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ref, customer..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="">All Statuses</option>
            {Object.values(ORDER_STATUS).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyTitle="No orders found"
        emptyDescription="Orders matching your query will appear here."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchOrders(page)}
      />
    </AdminLayout>
  );
};

export default AdminOrders;
