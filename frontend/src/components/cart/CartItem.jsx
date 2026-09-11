import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getImageUrl';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  if (!item) return null;

  const product = item.product || {};
  const itemId = item._id;
  const productId = product._id || item.product;
  const title = product.title || 'Product Item';
  const price = product.finalPrice !== undefined ? product.finalPrice : product.price || item.price || 0;
  const quantity = item.quantity || 1;
  const stock = product.stock !== undefined ? product.stock : 99;
  const imageUrl = getImageUrl(product.thumbnail || (product.images?.[0]));
  const productUrl = product.slug ? `/products/slug/${product.slug}` : `/products/${productId}`;

  return (
    <div className="flex items-start sm:items-center gap-4 py-4 border-b border-slate-100 last:border-b-0">
      {/* Product Image */}
      <Link
        to={productUrl}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </Link>

      {/* Title & Unit Price */}
      <div className="flex-1 min-w-0">
        <Link
          to={productUrl}
          className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1"
        >
          {title}
        </Link>
        {product.brand && (
          <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>
        )}
        <p className="text-xs font-semibold text-slate-700 mt-1 sm:hidden">
          {formatCurrency(price)}
        </p>
      </div>

      {/* Desktop Price */}
      <div className="hidden sm:block text-right w-24">
        <span className="text-sm font-bold text-slate-900">{formatCurrency(price)}</span>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => {
            if (quantity > 1) {
              onUpdateQuantity(itemId, quantity - 1, productId);
            } else {
              onRemove(itemId, productId);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-l-lg transition-colors cursor-pointer"
          title={quantity > 1 ? "Decrease quantity" : "Remove from cart"}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-xs font-bold text-slate-800 select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(itemId, quantity + 1, productId)}
          disabled={quantity >= stock}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 rounded-r-lg transition-colors cursor-pointer"
          title="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[70px]">
        <span className="text-sm font-extrabold text-indigo-600">
          {formatCurrency(price * quantity)}
        </span>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(itemId, productId)}
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
        title="Remove item from cart"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
