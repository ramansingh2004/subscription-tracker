'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CurrencyConverter } from '@/lib/currency-service';
import { useAuthStore } from '@/store/authStore';

interface SpendingChartProps {
  currency?: string;
  monthlyCost?: number;
}

export function SpendingChart({
  currency = 'USD',
  monthlyCost = 0,
}: SpendingChartProps) {
  const rates = useAuthStore((state) => state.rates);
  const data = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - index));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      cost: CurrencyConverter.convert(monthlyCost, 'USD', currency, rates),
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Current Monthly Spend Projection
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => typeof value === 'number' ? CurrencyConverter.format(value, currency) : '0.00'} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#BC6C25"
            strokeWidth={2}
            dot={{ fill: '#BC6C25' }}
            activeDot={{ r: 6, fill: '#283618', stroke: '#DDA15E', strokeWidth: 2 }}
            name="Monthly Spending"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
