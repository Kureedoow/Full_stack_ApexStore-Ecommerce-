import React, { useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import Input from '../common/Input';
import { COUNTRIES } from '../../utils/countries';

export const AddressSelector = ({
  addresses = [],
  selectedAddress,
  onSelectAddress,
  newAddress,
  onNewAddressChange,
  isEnteringNew,
  setIsEnteringNew,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Shipping Address</h3>
        </div>
        {addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setIsEnteringNew(!isEnteringNew)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {isEnteringNew ? 'Choose Saved Address' : 'Add New Address'}
          </button>
        )}
      </div>

      {/* Existing Saved Addresses */}
      {!isEnteringNew && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddress?._id === addr._id;
            return (
              <div
                key={addr._id}
                onClick={() => onSelectAddress(addr)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {addr.fullName || 'Customer Address'}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  <br />
                  {addr.city}, {addr.state} {addr.postalCode}
                  <br />
                  {addr.country}
                </p>
                {addr.phone && (
                  <p className="text-[11px] text-slate-400 mt-2">📞 {addr.phone}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Address Form */}
      {(isEnteringNew || addresses.length === 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Full Name *"
              placeholder="e.g. Jane Doe"
              value={newAddress.fullName || ''}
              onChange={(e) => onNewAddressChange('fullName', e.target.value)}
              required
            />
            <Input
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              value={newAddress.phone || ''}
              onChange={(e) => onNewAddressChange('phone', e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address *"
            placeholder="123 Shopping Avenue, Suite 4B"
            value={newAddress.addressLine1 || ''}
            onChange={(e) => onNewAddressChange('addressLine1', e.target.value)}
            required
          />

          <Input
            label="Apartment, suite, unit (optional)"
            placeholder="Apt 4B"
            value={newAddress.addressLine2 || ''}
            onChange={(e) => onNewAddressChange('addressLine2', e.target.value)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              label="City *"
              placeholder="New York"
              value={newAddress.city || ''}
              onChange={(e) => onNewAddressChange('city', e.target.value)}
              required
            />
            <Input
              label="State / Province *"
              placeholder="NY"
              value={newAddress.state || ''}
              onChange={(e) => onNewAddressChange('state', e.target.value)}
              required
            />
            <Input
              label="Postal Code *"
              placeholder="10001"
              value={newAddress.postalCode || ''}
              onChange={(e) => onNewAddressChange('postalCode', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Country / Region *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={COUNTRIES.includes(newAddress.country) ? newAddress.country : (newAddress.country ? 'Other' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    onNewAddressChange('country', '');
                  } else {
                    onNewAddressChange('country', val);
                  }
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
                placeholder="Country name (e.g. Canada, Germany...)"
                value={newAddress.country || ''}
                onChange={(e) => onNewAddressChange('country', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
