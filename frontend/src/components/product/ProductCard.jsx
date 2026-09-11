import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getImageUrl';
import ProductRating from './ProductRating';
import WishlistButton from '../wishlist/WishlistButton';
import useCart from '../../hooks/useCart';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const { add, isInCart } = useCart();

  if (!product) return null;

  const {
    _id,
    title,
    price,
    discountPercentage = 0,
    finalPrice,
    category,
    brand,
    thumbnail,
    images = [],
    rating = 0,
    reviewCount = 0,
    stock = 1,
    slug,
  } = product;

  const displayPrice = finalPrice !== undefined ? finalPrice : price;
  const originalPrice = discountPercentage > 0 ? price : null;
  const imageUrl = getImageUrl(thumbnail || (images.length > 0 ? images[0] : null));
  const productUrl = slug ? `/products/slug/${slug}` : `/products/${_id}`;
  const inCart = isInCart(_id);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    add(product, 1);
    toast.success(`Added ${title.slice(0, 20)}... to cart!`, {
      id: `cart-${_id}`,
      icon: '🛍️',
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all duration-300 flex flex-col">
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link to={productUrl} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-200">
            -{Math.round(discountPercentage)}%
          </span>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton product={product} size="sm" />
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 font-medium">
            {brand && <span className="text-indigo-600 font-semibold">{brand}</span>}
            {brand && category && <span>•</span>}
            {category && (
              <span className="capitalize truncate max-w-[120px]">
                {typeof category === 'object' ? category.name : category}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link to={productUrl} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug" title={title}>
              {title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2">
            <ProductRating rating={rating} reviewCount={reviewCount} size="xs" />
          </div>
        </div>

        {/* Bottom bar: Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(displayPrice)}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              inCart
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
            } disabled:opacity-40 disabled:pointer-events-none`}
            title={inCart ? 'Already in cart' : 'Add to cart'}
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
