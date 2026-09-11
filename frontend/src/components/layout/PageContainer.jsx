import React from 'react';

export const PageContainer = ({
  children,
  title,
  subtitle,
  action,
  maxWidth = 'max-w-7xl',
  className = '',
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
