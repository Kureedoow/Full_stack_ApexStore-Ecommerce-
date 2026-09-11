import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  MapPin,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { updateProfile } from '../store/slices/authSlice';
import PageContainer from '../components/layout/PageContainer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import getImageUrl from '../utils/getImageUrl';
import toast from 'react-hot-toast';

export const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    avatar: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      // ignore
    }
  };

  return (
    <PageContainer
      title="My Account"
      subtitle="Manage your personal preferences, security, and addresses"
      maxWidth="max-w-6xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 text-2xl font-bold overflow-hidden shadow-sm">
              {formData.avatar ? (
                <img
                  src={getImageUrl(formData.avatar)}
                  alt={formData.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{formData.firstName?.[0] || 'U'}</span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user?.role === 'admin' ? 'Administrator' : 'Customer Account'}</span>
              </div>
            </div>
          </div>

          {/* Quick Account Navigation Links */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1 text-left">
            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>Order History</span>
            </Link>

            <Link
              to="/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Shipping Addresses</span>
            </Link>

            <Link
              to="/change-password"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span>Change Password</span>
            </Link>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs text-left space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details and user identity
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Email Address (Read-only)"
              type="email"
              value={user?.email || ''}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Avatar Image URL"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
                className="shadow-md shadow-indigo-600/20"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default Profile;
