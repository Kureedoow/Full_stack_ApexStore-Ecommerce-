import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductRating from './ProductRating';
import WishlistButton from '../wishlist/WishlistButton';
import useCart from '../../hooks/useCart';
import toast from 'react-hot-toast';

export const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const {
    _id,
    title,
    price,
    discountPercentage = 0,
    finalPrice,
    category,
    brand,
    sku,
    stock = 1,
    rating = 0,
    reviewCount = 0,
    description,
    warrantyInformation = '1 Year Official Warranty',
    shippingInformation = 'Ships in 2-3 business days',
    returnPolicy = '30 Days Money-Back Guarantee',
    minimumOrderQuantity = 1,
  } = product;

  const displayPrice = finalPrice !== undefined ? finalPrice : price;
  const originalPrice = discountPercentage > 0 ? price : null;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= minimumOrderQuantity && newQty <= Math.min(stock, 50)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`, {
      icon: '🛍️',
      id: `cart-${_id}`,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    add(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col space-y-6 text-left">
      {/* Brand, SKU & Category */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {brand && <span className="text-indigo-600">{brand}</span>}
          {brand && <span>•</span>}
          {category && (
            <span>{typeof category === 'object' ? category.name : category}</span>
          )}
          {sku && <span>• SKU: {sku}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
      </div>

      {/* Ratings & Wishlist Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <ProductRating rating={rating} reviewCount={reviewCount} size="md" />
        <WishlistButton product={product} size="md" />
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-slate-900">
          {formatCurrency(displayPrice)}
        </span>
        {originalPrice && (
          <span className="text-lg text-slate-400 line-through">
            {formatCurrency(originalPrice)}
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200">
            Save {Math.round(discountPercentage)}%
          </span>
        )}
      </div>

      {/* Stock status indicator */}
      <div>
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
            ● Out of stock
          </span>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ● Only {stock} left in stock - order soon
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● In Stock ({stock} units available)
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {description}
        </p>
      )}

      {/* Quantity & Action Buttons */}
      {!isOutOfStock && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quantity
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= minimumOrderQuantity}
                className="p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
                className="p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-lg shadow-indigo-200 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white shadow-md transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{shippingInformation}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{warrantyInformation}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{returnPolicy}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
