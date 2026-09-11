import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import SalesChart from '../../components/admin/SalesChart';
import DataTable from '../../components/admin/DataTable';
import OrderStatus from '../../components/orders/OrderStatus';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import formatCurrency from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import getImageUrl from '../../utils/getImageUrl';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getDashboard();
        setData(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Overview Dashboard">
        <Loader message="Loading dashboard insights..." />
      </AdminLayout>
    );
  }

  const orderColumns = [
    {
      key: '_id',
      header: 'Order',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          #{row._id?.slice(-6).toUpperCase()}
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
          <span className="block text-[11px] text-slate-400 truncate max-w-[150px]">
            {row.user?.email}
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
      key: 'orderStatus',
      header: 'Status',
      render: (row) => <OrderStatus status={row.orderStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Link
          to={`/orders/${row._id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operations and revenue summary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-sm shadow-indigo-600/20"
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon={DollarSign}
          color="indigo"
          trend={14}
        />
        <StatsCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={ShoppingBag}
          color="emerald"
          trend={8}
        />
        <StatsCard
          title="Active Products"
          value={data?.totalProducts || 0}
          icon={Package}
          color="violet"
          trend={0}
        />
        <StatsCard
          title="Registered Customers"
          value={data?.totalUsers || 0}
          icon={Users}
          color="amber"
          trend={5}
        />
      </div>

      {/* Revenue Graph & Quick alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SalesChart />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Watch */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Low Stock Alert
                </h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {data?.lowStockProducts?.length || 0}
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                data.lowStockProducts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {p.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold font-mono">
                      {p.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  All inventory stocks are healthy.
                </p>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Administrative Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/admin/products"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-slate-700 transition-colors"
              >
                Products
              </Link>
              <Link
                to="/admin/orders"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-slate-700 transition-colors"
              >
                Orders
              </Link>
              <Link
                to="/admin/users"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-slate-700 transition-colors"
              >
                Users
              </Link>
              <Link
                to="/admin/coupons"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-slate-700 transition-colors"
              >
                Coupons
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={orderColumns}
          data={data?.recentOrders || []}
          emptyTitle="No recent orders"
          emptyDescription="Orders placed by customers will appear here."
        />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
