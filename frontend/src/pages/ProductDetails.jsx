import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { fetchProductById } from '../store/slices/productSlice';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductReviews from '../components/product/ProductReviews';
import RelatedProducts from '../components/product/RelatedProducts';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import PageContainer from '../components/layout/PageContainer';

export const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentProduct, isLoading, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, id]);

  if (isLoading) {
    return <Loader fullScreen={false} message="Loading product specifications..." />;
  }

  if (error || !currentProduct) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <ErrorMessage
          title="Product not found"
          message={error || "The product you're searching for does not exist or has been removed."}
          action={
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700"
            >
              Browse All Products
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const categoryName = typeof currentProduct.category === 'object'
    ? currentProduct.category?.name
    : currentProduct.category;

  return (
    <PageContainer maxWidth="max-w-7xl">
      {/* Breadcrumb Bar */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
          <HomeIcon className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <Link to="/products" className="hover:text-slate-900 transition-colors">
          Products
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              to={`/products?category=${encodeURIComponent(categoryName)}`}
              className="hover:text-slate-900 transition-colors capitalize"
            >
              {categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">
          {currentProduct.title}
        </span>
      </nav>

      {/* Main Grid: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-16">
        <div className="lg:col-span-6 xl:col-span-7">
          <ProductGallery
            images={currentProduct.images}
            thumbnail={currentProduct.thumbnail}
            title={currentProduct.title}
          />
        </div>

        <div className="lg:col-span-6 xl:col-span-5">
          <ProductInfo product={currentProduct} />
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mb-16">
        <ProductReviews
          productId={currentProduct._id}
          initialRating={currentProduct.rating}
          initialReviewCount={currentProduct.reviewCount}
        />
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={currentProduct.category}
        currentProductId={currentProduct._id}
      />
    </PageContainer>
  );
};

export default ProductDetails;
