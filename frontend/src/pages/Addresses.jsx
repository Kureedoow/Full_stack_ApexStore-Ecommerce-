import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, CheckCircle2, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import userApi from '../api/userApi';
import PageContainer from '../components/layout/PageContainer';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { COUNTRIES } from '../utils/countries';

export const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await userApi.getAddresses();
      setAddresses(res.data?.addresses || res.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.addAddress(formData);
      toast.success('Address added successfully!');
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      await userApi.deleteAddress(addressId);
      toast.success('Address removed');
      fetchAddresses();
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await userApi.setDefaultAddress(addressId);
      toast.success('Default address updated');
      fetchAddresses();
    } catch {
      toast.error('Failed to set default address');
    }
  };

  return (
    <PageContainer
      title="Shipping Addresses"
      subtitle="Manage your preferred delivery addresses for quick checkout"
      action={
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Profile
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
            className="shadow-sm shadow-indigo-600/20"
          >
            Add New Address
          </Button>
        </div>
      }
      maxWidth="max-w-5xl"
    >
      {isLoading ? (
        <Loader message="Loading addresses..." />
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center shadow-xs">
          <EmptyState
            icon={MapPin}
            title="No addresses saved"
            description="You don't have any saved shipping addresses yet. Add one to speed up future checkouts."
            action={
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-4"
              >
                Add Your First Address
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {addresses.map((addr) => {
            const id = addr._id;
            return (
              <div
                key={id}
                className={`bg-white rounded-3xl border-2 p-6 shadow-xs relative transition-all ${
                  addr.isDefault
                    ? 'border-indigo-600/80 bg-indigo-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-indigo-600" />
                        Default
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  <p className="pt-2 font-mono text-slate-400">Phone: {addr.phone}</p>
                </div>

                {!addr.isDefault && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Set as Default
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Shipping Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
            />
            <Input
              label="Contact Phone *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>

          <Input
            label="Street Address *"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="123 Main St"
            required
          />

          <Input
            label="Apartment, Suite, Unit (Optional)"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Apt 4B"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              required
            />
            <Input
              label="State / Prov *"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
              required
            />
            <Input
              label="Postal Code *"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="10001"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Country / Region *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={COUNTRIES.includes(formData.country) ? formData.country : (formData.country ? 'Other' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    country: val === 'Other' ? '' : val,
                  }));
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              >
                <option value="">-- Choose Country --</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other / Enter Custom</option>
              </select>
              <input
                type="text"
                name="country"
                placeholder="Country name (e.g. Canada, Germany...)"
                value={formData.country || ''}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Set as my default shipping address
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Addresses;
