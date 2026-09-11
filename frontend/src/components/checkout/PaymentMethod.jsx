import React from 'react';
import { CreditCard, Banknote, Smartphone, Globe, Check } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';

export const PaymentMethod = ({ selectedMethod = 'card', onSelectMethod }) => {
  const getIcon = (id) => {
    switch (id) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'cash_on_delivery':
        return <Banknote className="w-5 h-5" />;
      case 'mobile_payment':
        return <Smartphone className="w-5 h-5" />;
      case 'online_payment':
        return <Globe className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <CreditCard className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Payment Method</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {getIcon(method.id)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{method.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{method.description}</p>
                </div>
              </div>
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethod;
