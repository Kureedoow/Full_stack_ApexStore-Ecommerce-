import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Ticket, CheckCircle2, XCircle, Search } from 'lucide-react';
import couponApi from '../../api/couponApi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import formatCurrency from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '15',
    minimumPurchase: '0',
    maximumDiscount: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await couponApi.getCoupons();
      const data = res.data?.data || res.data;
      setCoupons(data.coupons || (Array.isArray(data) ? data : []));
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '15',
      minimumPurchase: '0',
      maximumDiscount: '',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || '',
      description: c.description || '',
      discountType: c.discountType || 'percentage',
      discountValue: String(c.discountValue || 0),
      minimumPurchase: String(c.minimumPurchase || 0),
      maximumDiscount: c.maximumDiscount ? String(c.maximumDiscount) : '',
      expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
      isActive: c.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue || !formData.expiryDate) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumPurchase: parseFloat(formData.minimumPurchase) || 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await couponApi.updateCoupon(editingCoupon._id, payload);
        toast.success('Coupon updated');
      } else {
        await couponApi.createCoupon(payload);
        toast.success('Coupon created successfully');
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await couponApi.deleteCoupon(couponToDelete._id);
      toast.success('Coupon deleted');
      setDeleteModalOpen(false);
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = coupons.filter((c) =>
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'code',
      header: 'Promo Code',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
              {row.code}
            </span>
            {row.description && (
              <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">
                {row.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Benefit',
      render: (row) => (
        <span className="text-xs font-bold text-emerald-600">
          {row.discountType === 'percentage'
            ? `${row.discountValue}% OFF`
            : `${formatCurrency(row.discountValue)} OFF`}
        </span>
      ),
    },
    {
      key: 'minPurchase',
      header: 'Min Spend',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.minimumPurchase > 0 ? formatCurrency(row.minimumPurchase) : 'None'}
        </span>
      ),
    },
    {
      key: 'expiry',
      header: 'Expires On',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.expiryDate)}</span>
      ),
    },
    {
      key: 'usage',
      header: 'Used / Limit',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.usedCount || 0} / {row.usageLimit !== null ? row.usageLimit : '∞'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          <span>{row.isActive ? 'Active' : 'Disabled'}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCouponToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Coupon Discounts">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Promotions & Vouchers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create discount vouchers, percentage promotional codes, and cart minimum rules
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-sm shadow-indigo-600/20"
        >
          Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="No coupons created"
        emptyDescription="Create a promotional coupon code for customer checkout discounts."
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Coupon Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. FLASH25"
              className="uppercase font-mono"
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={formData.discountType === 'percentage' ? 'Discount Value (%) *' : 'Discount Value ($) *'}
              type="number"
              min="1"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />

            <Input
              label="Minimum Purchase ($)"
              type="number"
              min="0"
              value={formData.minimumPurchase}
              onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Expiration Date *"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />

            <Input
              label="Usage Limit (Blank for unlimited)"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="e.g. 100"
            />
          </div>

          <Input
            label="Description / Campaign Name"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Summer launch promotion"
          />

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Coupon is active and redeemable immediately
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Coupon"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete coupon{' '}
            <strong className="text-slate-900 font-mono">{couponToDelete?.code}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminCoupons;
