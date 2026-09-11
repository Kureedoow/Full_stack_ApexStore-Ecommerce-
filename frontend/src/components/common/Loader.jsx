import React from 'react';
import Spinner from './Spinner';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spinner size="xl" className="text-indigo-600" />
        {message && <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Spinner size="lg" className="text-indigo-600" />
      {message && <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default Loader;
