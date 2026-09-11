export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [ORDER_STATUS.PROCESSING]: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  [ORDER_STATUS.SHIPPED]: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  [ORDER_STATUS.REFUNDED]: { label: 'Refunded', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const PAYMENT_METHODS = [
  { id: 'cash_on_delivery', name: 'Cash on Delivery', description: 'Pay in cash upon arrival' },
  { id: 'card', name: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex' },
  { id: 'mobile_payment', name: 'Mobile Wallet', description: 'Apple Pay, Google Pay, bKash' },
  { id: 'online_payment', name: 'Online Banking', description: 'Direct secure bank transfer' },
];

export const PAYMENT_STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', color: 'bg-rose-100 text-rose-700' },
  refunded: { label: 'Refunded', color: 'bg-slate-100 text-slate-700' },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Best Selling' },
  { value: 'oldest', label: 'Oldest First' },
];

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};
