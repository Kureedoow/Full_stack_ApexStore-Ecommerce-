import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, setFilters, resetFilters } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import ProductSort from '../components/product/ProductSort';
import Pagination from '../components/common/Pagination';
import PageContainer from '../components/layout/PageContainer';
import useDebounce from '../hooks/useDebounce';

export const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { items: products, pagination, filters, isLoading } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync url params into redux initially
  useEffect(() => {
    dispatch(fetchCategories());
    const initialCategory = searchParams.get('category') || '';
    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || 'newest';
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    dispatch(
      setFilters({
        category: initialCategory,
        search: initialSearch,
        sort: initialSort,
      })
    );
  }, [dispatch, searchParams]);

  // Trigger product fetch when filters change
  useEffect(() => {
    const params = {
      page: pagination.page || 1,
      limit: 12,
      sort: filters.sort,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: true }),
    };

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    filters.category,
    filters.search,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    pagination.page,
  ]);

  // Handle debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch }));
      updateUrlParam('search', debouncedSearch);
    }
  }, [debouncedSearch]);

  const updateUrlParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleCategorySelect = (catId) => {
    dispatch(setFilters({ category: catId }));
    updateUrlParam('category', catId);
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (newSort) => {
    dispatch(setFilters({ sort: newSort }));
    updateUrlParam('sort', newSort);
  };

  const handlePriceChange = (field, value) => {
    if (field === 'minPrice') {
      dispatch(setFilters({ minPrice: value }));
    } else {
      dispatch(setFilters({ maxPrice: value }));
    }
  };

  const handleStockChange = (checked) => {
    dispatch(setFilters({ inStock: checked }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchInput('');
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    updateUrlParam('page', newPage);
    dispatch(
      fetchProducts({
        page: newPage,
        limit: 12,
        sort: filters.sort,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.inStock && { inStock: true }),
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer
      title="All Products"
      subtitle={`Showing ${pagination.totalCount || products.length} available products`}
      maxWidth="max-w-7xl"
    >
      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by title, tag, or brand..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          <ProductSort currentSort={filters.sort} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilters
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={handleCategorySelect}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onPriceChange={handlePriceChange}
            inStock={filters.inStock}
            onStockChange={handleStockChange}
            onResetFilters={handleReset}
          />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            skeletonCount={9}
            emptyTitle="No products match your criteria"
            emptyDescription="Try clearing some of your filters or searching with different keywords."
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-slate-100">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-base text-slate-900">Filter Products</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilters
              categories={categories}
              selectedCategory={filters.category}
              onSelectCategory={handleCategorySelect}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onPriceChange={handlePriceChange}
              inStock={filters.inStock}
              onStockChange={handleStockChange}
              onResetFilters={handleReset}
              className="border-0 p-0 shadow-none"
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Products;
