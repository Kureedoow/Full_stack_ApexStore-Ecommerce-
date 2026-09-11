import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import formatCurrency from '../utils/formatCurrency';
import getImageUrl from '../utils/getImageUrl';
import toast from 'react-hot-toast';

export const Wishlist = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, isLoading } = useSelector((state) => state.wishlist);
  const { add } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = async (product) => {
    try {
      await dispatch(removeFromWishlist(product)).unwrap();
      toast.success('Removed from wishlist');
    } catch {
      // Still remove locally even if server is unreachable
      dispatch(removeFromWishlist(product));
      toast.success('Removed from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await add(product, 1);
      toast.success('Moved to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center shadow-xs">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Explore our catalog and click the heart icon on any product to save it for later."
            action={
              <Link to="/products">
                <Button variant="primary" size="lg" className="mt-4 shadow-lg shadow-indigo-600/20">
                  Explore Products
                </Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="My Wishlist"
      subtitle={`You have ${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'item' : 'items'}`}
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const id = product._id || product.id;
          const title = product.title || 'Product';
          const price = product.finalPrice !== undefined ? product.finalPrice : product.price || 0;
          const imgUrl = getImageUrl(product.thumbnail || product.images?.[0]);
          const inStock = product.stock > 0;

          return (
            <div
              key={id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden text-left"
            >
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <Link to={`/products/${id}`}>
                  <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400?text=Product';
                    }}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(product)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-sm transition-all"
                  title="Delete from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {!inStock && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${id}`}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 transition-colors"
                  >
                    {title}
                  </Link>
                  <p className="text-sm font-extrabold text-indigo-600 mt-1.5">
                    {formatCurrency(price)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!inStock}
                    onClick={() => handleAddToCart(product)}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(product)}
                    title="Delete item"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default Wishlist;
