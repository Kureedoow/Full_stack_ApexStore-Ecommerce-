import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductGrid from './ProductGrid';

export const RelatedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    const fetchRelated = async () => {
      try {
        setIsLoading(true);
        const catId = typeof category === 'object' ? category.slug || category.name : category;
        const res = await productApi.getProducts({ category: catId, limit: 4, sort: 'newest' });
        // axios interceptor returns response.data = { success, message, data: [...products] }
        const items = Array.isArray(res.data) ? res.data : [];
        setProducts(items.filter((p) => p._id !== currentProductId));
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [category, currentProductId]);

  if (!isLoading && products.length === 0) return null;

  return (
    <div className="pt-12 border-t border-slate-200/80">
      <div className="mb-6 text-left">
        <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
        <p className="text-xs text-slate-500 mt-1">Discover more items in this category</p>
      </div>
      <ProductGrid products={products} isLoading={isLoading} skeletonCount={4} />
    </div>
  );
};

export default RelatedProducts;
