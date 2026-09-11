import React from 'react';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';
import getImageUrl from '../../utils/getImageUrl';

export const OrderItem = ({ item }) => {
  if (!item) return null;

  const productId = item.product?._id || item.product;
  const title = item.title || item.product?.title || 'Product';
  const imgUrl = getImageUrl(item.image || item.product?.thumbnail || item.product?.images?.[0]);
  const price = item.price ?? 0;
  const quantity = item.quantity ?? 1;
  const subtotal = item.subtotal ?? price * quantity;

  return (
    <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 text-left">
      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/70">
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/100x100?text=Item';
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        {productId ? (
          <Link
            to={`/products/${productId}`}
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {title}
          </Link>
        ) : (
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{title}</h4>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Quantity: <span className="font-semibold text-slate-700">{quantity}</span> × {formatCurrency(price)}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span className="text-sm font-extrabold text-slate-900">
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
