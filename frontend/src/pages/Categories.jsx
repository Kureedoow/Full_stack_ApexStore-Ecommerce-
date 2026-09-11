import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, ArrowRight, Search, Tag } from 'lucide-react';
import { fetchCategories } from '../store/slices/categorySlice';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import getImageUrl from '../utils/getImageUrl';

export const Categories = () => {
  const dispatch = useDispatch();
  const { items: categories, isLoading } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer
      title="Shop by Category"
      subtitle="Explore all available categories and departments"
      maxWidth="max-w-7xl"
    >
      {/* Search Input */}
      <div className="max-w-md mb-8">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter categories..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader message="Loading categories..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No categories found"
          description="No categories match your search term."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((category) => {
            const catId = category._id || category.name;
            const slug = category.slug || category.name || category._id;
            const img = category.image ? getImageUrl(category.image) : null;

            return (
              <Link
                key={catId}
                to={`/products?category=${encodeURIComponent(slug)}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-200 hover:-translate-y-1 text-left relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    {img ? (
                      <img
                        src={img}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Tag className="w-7 h-7" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    {category.productCount !== undefined
                      ? `${category.productCount} Products`
                      : 'View Collection'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default Categories;
