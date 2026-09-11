import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import formatCurrency from '../../utils/formatCurrency';
import getImageUrl from '../../utils/getImageUrl';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await productApi.getProducts({
        page,
        limit: 10,
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const data = res.data?.data || res.data;
      setProducts(data.products || data.items || (Array.isArray(data) ? data : []));
      setTotalPages(data.pagination?.totalPages || data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      setCategories(res.data?.categories || res.data || []);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productApi.deleteProduct(productToDelete._id);
      toast.success('Product deleted successfully');
      setDeleteModalOpen(false);
      fetchProducts(currentPage);
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      await productApi.patchProduct(product._id, {
        isPublished: !product.isPublished,
      });
      toast.success(
        product.isPublished ? 'Product unpublished' : 'Product published live'
      );
      fetchProducts(currentPage);
    } catch {
      toast.error('Could not update status');
    }
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/70 shrink-0">
            <img
              src={getImageUrl(row.thumbnail || row.images?.[0])}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://placehold.co/100x100?text=Product';
              }}
            />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate max-w-[200px]">
              {row.title}
            </span>
            <span className="block text-[11px] text-slate-400 capitalize">
              {typeof row.category === 'object' ? row.category?.name : row.category || 'Uncategorized'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <div>
          <span className="block text-xs font-bold text-slate-900">
            {formatCurrency(row.finalPrice !== undefined ? row.finalPrice : row.price)}
          </span>
          {row.discountPercentage > 0 && (
            <span className="text-[10px] text-emerald-600 font-semibold">
              -{row.discountPercentage}% off
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
            row.stock <= 5
              ? 'bg-rose-50 text-rose-600'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {row.stock} in stock
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Visibility',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(row)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            row.isPublished
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {row.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{row.isPublished ? 'Live' : 'Draft'}</span>
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/products/${row._id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setProductToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Product Inventory">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure prices, inventory stock levels, and publication status
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm shadow-indigo-600/20"
          >
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, brand..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c._id || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Try modifying your search keywords or add a new product."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchProducts(page)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">{productToDelete?.title}</strong>? This action cannot be undone.
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
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
