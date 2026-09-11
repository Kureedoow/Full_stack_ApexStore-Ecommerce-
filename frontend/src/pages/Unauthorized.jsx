import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl sm:text-6xl font-black text-rose-600 tracking-tight">
            403
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            You do not possess the administrative privileges required to access this portal. Please sign in with an authorized account.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Return to Store
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="md">
              Sign In as Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
