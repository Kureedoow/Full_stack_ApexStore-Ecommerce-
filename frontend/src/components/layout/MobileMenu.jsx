import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, Grid, FolderTree, Heart, ShoppingBag, User, LogOut, ShieldCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isOpen) return null;

  const handleLinkClick = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
      navigate('/');
    } catch {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-lg font-bold text-slate-900">ApexStore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview banner */}
        {isAuthenticated ? (
          <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </p>
            {isAdmin && (
              <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Admin
              </span>
            )}
          </div>
        ) : (
          <div className="my-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/login')}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/register')}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-2">
          <button
            type="button"
            onClick={() => handleLinkClick('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/products')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Grid className="w-4 h-4" />
            All Products
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/categories')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <FolderTree className="w-4 h-4" />
            Categories
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/wishlist')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/cart')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Cart
          </button>

          {isAuthenticated && (
            <>
              <div className="pt-4 pb-1 border-t border-slate-100 my-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Account
                </span>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleLinkClick('/admin/dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Admin Dashboard
                </button>
              )}
              <button
                type="button"
                onClick={() => handleLinkClick('/profile')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile & Settings
              </button>
              <button
                type="button"
                onClick={() => handleLinkClick('/orders')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </button>
            </>
          )}
        </nav>

        {/* Footer actions */}
        {isAuthenticated && (
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
