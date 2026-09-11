import React, { useState } from 'react';
import { getImageUrl } from '../../utils/getImageUrl';

export const ProductGallery = ({ images = [], thumbnail, title = 'Product' }) => {
  const allImages = images && images.length > 0
    ? images
    : thumbnail
    ? [thumbnail]
    : ['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80'];

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = getImageUrl(allImages[activeIndex] || allImages[0]);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnail column */}
      {allImages.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[480px] pb-2 sm:pb-0 scrollbar-none">
          {allImages.map((img, idx) => {
            const url = getImageUrl(img);
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={url}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main showcase image */}
      <div className="flex-1 aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden relative shadow-sm group">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
