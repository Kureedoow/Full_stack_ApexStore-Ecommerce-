import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import formatCurrency from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="text-indigo-300 font-extrabold text-sm">
          Sales: {formatCurrency(payload[0].value)}
        </p>
        {payload[1] && (
          <p className="text-emerald-300 font-medium">
            Orders: {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const SalesChart = ({ data = [], height = 300 }) => {
  // Default mock fallback if empty
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', sales: 1200, orders: 14 },
    { name: 'Tue', sales: 2100, orders: 22 },
    { name: 'Wed', sales: 1800, orders: 18 },
    { name: 'Thu', sales: 2900, orders: 31 },
    { name: 'Fri', sales: 3400, orders: 40 },
    { name: 'Sat', sales: 4800, orders: 52 },
    { name: 'Sun', sales: 3900, orders: 44 },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue & Sales Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Overview of revenue over time</p>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
