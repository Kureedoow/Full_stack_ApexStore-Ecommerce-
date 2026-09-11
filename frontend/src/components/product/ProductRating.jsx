import React from 'react';
import { Star } from 'lucide-react';

export const ProductRating = ({ rating = 0, reviewCount = null, size = 'sm', showNumber = true }) => {
  const numRating = Number(rating) || 0;
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  const currentSize = starSizes[size] || starSizes.sm;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = numRating >= star;
          const isHalf = !isFilled && numRating >= star - 0.5;
          return (
            <Star
              key={star}
              className={`${currentSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700">
          {numRating.toFixed(1)}
        </span>
      )}
      {reviewCount !== null && (
        <span className="text-xs text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
};

export default ProductRating;
