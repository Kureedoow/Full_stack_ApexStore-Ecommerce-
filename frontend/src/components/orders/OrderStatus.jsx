import React from 'react';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

export const OrderStatus = ({ status = 'pending', size = 'md' }) => {
  const normalizedStatus = status.toLowerCase();
  const config = ORDER_STATUS_LABELS[normalizedStatus] || {
    label: status.toUpperCase(),
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  const isLive = ['pending', 'processing', 'confirmed', 'shipped'].includes(normalizedStatus);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${config.color} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {config.label}
    </span>
  );
};

export default OrderStatus;
