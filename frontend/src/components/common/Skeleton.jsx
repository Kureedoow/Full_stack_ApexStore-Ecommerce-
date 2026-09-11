import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col">
    <Skeleton className="w-full aspect-square rounded-xl mb-4" />
    <Skeleton className="w-1/3 h-4 mb-2" />
    <Skeleton className="w-4/5 h-5 mb-3" />
    <div className="mt-auto flex items-center justify-between pt-2">
      <Skeleton className="w-1/3 h-6" />
      <Skeleton className="w-10 h-10 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-5 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
