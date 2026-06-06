'use client';

import { useEffect, useState } from 'react';
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

interface SpendingChartProps {
  currency?: string;
}

export function SpendingChart({ currency = 'USD' }: SpendingChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Generate 12-month data
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const usdCost = Math.random() * 200 + 50; // Simulated USD data
          const convertedCost = CurrencyConverter.convert(usdCost, 'USD', currency);
          months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            cost: convertedCost,
          });
        }
        setData(months);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [currency]);

  if (isLoading) {
    return <div className="bg-white p-6 rounded-lg shadow h-80">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        12-Month Spending Trend
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