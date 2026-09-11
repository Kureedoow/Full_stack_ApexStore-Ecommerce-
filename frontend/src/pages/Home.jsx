import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';

export const Home = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { items: categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: 'popular' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const features = [
    {
      icon: Truck,
      title: 'Free Express Shipping',
      desc: 'On all orders exceeding $100',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      desc: '100% protected checkout',
    },
    {
      icon: RotateCcw,
      title: '30-Day Easy Returns',
      desc: 'Money back guarantee',
    },
    {
      icon: Headphones,
      title: '24/7 Dedicated Support',
      desc: 'Instant help whenever needed',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white py-16 sm:py-24 px-6 sm:px-12 mx-4 sm:mx-6 lg:mx-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-3xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summer Collection 2026 Live Now</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Discover Premium Products <br className="hidden sm:inline" />
            Tailored For Your Style.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            Shop the latest trends in electronics, fashion, and lifestyle with guaranteed authenticity and lightning-fast global delivery.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/products">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-indigo-600/30"
              >
                Explore Collection
              </Button>
            </Link>
            <Link to="/categories">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              >
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a category to quickly filter curated collections
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id || cat.name}
              to={`/products?category=${encodeURIComponent(cat.slug || cat.name || '')}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center justify-center gap-3 text-center shadow-xs hover:shadow-md hover:border-indigo-200 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/70 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                  {cat.name}
                </h4>
                {cat.productCount !== undefined && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {cat.productCount} items
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Trending & Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Top rated customer favorites available now
              </p>
            </div>
          </div>
          <Link
            to="/products?sort=-soldCount"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid
          products={products.slice(0, 8)}
          isLoading={productsLoading}
          skeletonCount={8}
        />
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
              Limited Time Special Offer
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Get 20% Off On Your First Purchase
            </h3>
            <p className="text-sm text-indigo-100 max-w-md">
              Apply code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">WELCOME20</span> at checkout to unlock savings today.
            </p>
          </div>
          <Link to="/products" className="shrink-0">
            <Button
              variant="dark"
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-100 shadow-xl"
            >
              Shop Deals Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
