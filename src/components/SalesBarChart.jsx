import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/csvUtils.mjs';

const SalesBarChart = ({ title, data }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30">
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
        barCategoryGap={8}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          type="number"
          tick={{ fill: '#9ca3af' }}
          tickFormatter={(value) => formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        />
        <YAxis type="category" dataKey="owner" width={160} tick={{ fill: '#e5e7eb' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #8b5cf6',
            borderRadius: '8px',
          }}
          formatter={(value) => [formatCurrency(value), 'Amount']}
          labelStyle={{ color: '#e5e7eb' }}
        />
        <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default SalesBarChart;


