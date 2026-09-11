import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    price: '',
    discountPercentage: '0',
    stock: '10',
    thumbnail: '',
    imagesInput: '',
    warrantyInformation: '1 Year Warranty',
    shippingInformation: 'Ships in 2-3 business days',
    returnPolicy: '30-day money-back guarantee',
    isPublished: true,
  });

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      const cats = res.data?.categories || res.data || [];
      setCategories(cats);
      if (!isEditMode && cats.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: cats[0]._id || cats[0].name }));
      }
    });

    if (isEditMode) {
      productApi
        .getProductById(id)
        .then((res) => {
          const p = res.data?.product || res.data;
          setFormData({
            title: p.title || '',
            description: p.description || '',
            category: typeof p.category === 'object' ? p.category?._id : p.category || '',
            brand: p.brand || '',
            sku: p.sku || '',
            price: p.price !== undefined ? String(p.price) : '',
            discountPercentage: String(p.discountPercentage || 0),
            stock: String(p.stock || 0),
            thumbnail: p.thumbnail || '',
            imagesInput: Array.isArray(p.images) ? p.images.join(', ') : '',
            warrantyInformation: p.warrantyInformation || '',
            shippingInformation: p.shippingInformation || '',
            returnPolicy: p.returnPolicy || '',
            isPublished: p.isPublished ?? true,
          });
        })
        .catch(() => {
          toast.error('Failed to load product details');
          navigate('/admin/products');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Please enter title, price, and select a category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const imagesArray = formData.imagesInput
        ? formData.imagesInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        brand: formData.brand.trim() || undefined,
        sku: formData.sku.trim() || undefined,
        price: parseFloat(formData.price),
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        thumbnail: formData.thumbnail.trim() || (imagesArray[0] || ''),
        images: imagesArray.length > 0 ? imagesArray : (formData.thumbnail ? [formData.thumbnail] : []),
        warrantyInformation: formData.warrantyInformation,
        shippingInformation: formData.shippingInformation,
        returnPolicy: formData.returnPolicy,
        isPublished: formData.isPublished,
      };

      if (isEditMode) {
        await productApi.updateProduct(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created successfully!');
      }

      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title={isEditMode ? 'Edit Product' : 'New Product'}>
        <Loader message="Loading product data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditMode ? 'Edit Product' : 'Create Product'}>
      <div className="space-y-6 text-left">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Product Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c._id || c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Sony, Apple, Nike"
              />

              <Input
                label="SKU Code"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. WH-1000XM5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed specifications and product description..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Base Price ($) *"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <Input
                label="Discount (%)"
                name="discountPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="0"
              />

              <Input
                label="Available Stock Units *"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Media & Images
            </h3>

            <div className="space-y-4">
              <Input
                label="Thumbnail Image URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                leftIcon={<ImageIcon className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Additional Image URLs (Comma separated)
                </label>
                <textarea
                  rows={2}
                  name="imagesInput"
                  value={formData.imagesInput}
                  onChange={handleChange}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Policies & Visibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Warranty Info"
                name="warrantyInformation"
                value={formData.warrantyInformation}
                onChange={handleChange}
                placeholder="1 Year Manufacturer Warranty"
              />
              <Input
                label="Shipping Policy"
                name="shippingInformation"
                value={formData.shippingInformation}
                onChange={handleChange}
                placeholder="Ships within 24 hours"
              />
              <Input
                label="Return Policy"
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleChange}
                placeholder="30 days return"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-900">
                  Publish product immediately to online store catalog
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/admin/products">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              className="shadow-md shadow-indigo-600/20"
            >
              {isEditMode ? 'Save Product Changes' : 'Create & Publish Product'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
