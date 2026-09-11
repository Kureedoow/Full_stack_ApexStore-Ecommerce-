import React from 'react';
import { Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export const WishlistButton = ({ product, className = '', size = 'md' }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const productId = product?._id || product?.id;
  const isWishlisted = wishlistItems.some((item) => (item._id || item.id) === productId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;

    dispatch(toggleWishlistItem(product));
    if (isWishlisted) {
      toast.success('Removed from wishlist', { id: `wishlist-${productId}` });
    } else {
      toast.success('Added to wishlist', { id: `wishlist-${productId}` });
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 p-1',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm ${
        isWishlisted
          ? 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100'
          : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/80'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <Heart
        className={`${iconSizes[size] || iconSizes.md} transition-colors ${
          isWishlisted ? 'fill-rose-500 text-rose-500' : ''
        }`}
      />
    </button>
  );
};

export default WishlistButton;
