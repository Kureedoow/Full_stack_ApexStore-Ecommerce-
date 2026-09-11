import React, { useEffect, useState } from 'react';
import { Star, Trash2, MessageSquare, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import productApi from '../../api/productApi';
import reviewApi from '../../api/reviewApi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import ProductRating from '../../components/product/ProductRating';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';
import getImageUrl from '../../utils/getImageUrl';
import toast from 'react-hot-toast';

export const AdminReviews = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load top reviewed products
    productApi.getProducts({ limit: 50 }).then((res) => {
      const data = res.data?.data || res.data;
      const items = data.products || data.items || (Array.isArray(data) ? data : []);
      setProducts(items);
      if (items.length > 0) {
        setSelectedProductId(items[0]._id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchReviewsForProduct = async (prodId) => {
    if (!prodId) return;
    try {
      setIsLoading(true);
      const res = await reviewApi.getProductReviews(prodId);
      setReviews(res.data?.data || res.data?.reviews || res.data || []);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchReviewsForProduct(selectedProductId);
    }
  }, [selectedProductId]);

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await reviewApi.deleteReview(reviewToDelete._id);
      toast.success('Review removed');
      setDeleteModalOpen(false);
      fetchReviewsForProduct(selectedProductId);
    } catch {
      toast.error('Failed to remove review');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const columns = [
    {
      key: 'user',
      header: 'Author',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
            {row.user?.avatar ? (
              <img src={getImageUrl(row.user.avatar)} alt={row.user?.firstName} className="w-full h-full object-cover" />
            ) : (
              <span>{row.user?.firstName?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">
              {row.user?.firstName} {row.user?.lastName || ''}
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              @{row.user?.username || 'customer'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => <ProductRating rating={row.rating} showNumber={false} size="sm" />,
    },
    {
      key: 'comment',
      header: 'Review Comment',
      render: (row) => (
        <div>
          {row.title && (
            <span className="block text-xs font-bold text-slate-900 mb-0.5">
              {row.title}
            </span>
          )}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {row.comment}
          </p>
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
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setReviewToDelete(row);
            setDeleteModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete abusive review"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Reviews Moderation">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Feedback & Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer product ratings, flag inappropriate comments, and remove spam
          </p>
        </div>
      </div>

      {/* Select Product Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="w-full sm:w-96 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter by Product:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.reviewCount || 0} reviews)
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              <img
                src={getImageUrl(selectedProduct.thumbnail || selectedProduct.images?.[0])}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 max-w-[200px] truncate">
                {selectedProduct.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <ProductRating rating={selectedProduct.rating || 0} size="sm" />
                <Link
                  to={`/products/${selectedProduct._id}`}
                  target="_blank"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-medium"
                >
                  <span>View page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyTitle="No reviews for this product"
        emptyDescription="This product has not received any customer reviews yet."
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Customer Review"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove this review? This action cannot be reverted.
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
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminReviews;
