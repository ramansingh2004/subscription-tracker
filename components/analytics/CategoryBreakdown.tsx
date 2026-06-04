'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Category {
  category: string;
  count: number;
  totalCost: number;
}

interface Props {
  categories: Category[];
}

const COLORS = [
  '#283618',
  '#606C38',
  '#BC6C25',
  '#DDA15E',
  '#8B7355',
  '#A0855B',
  '#4A5D23',
];

export function CategoryBreakdown({ categories }: Props) {
  const totalCost = categories.reduce((sum, cat) => sum + cat.totalCost, 0);

  const data = categories.map((cat) => ({
    name: cat.category,
    value: cat.totalCost,
    count: cat.count,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) =>
              `${name} ($${value.toFixed(0)})`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : '0.00'}`} />
        </PieChart>
      </ResponsiveContainer>

      {/* Category List */}
      <div className="mt-6 space-y-3">
        {categories.map((cat, index) => (
          <div
            key={cat.category}
            className="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div>
                <p className="font-medium text-gray-900">{cat.category}</p>
                <p className="text-sm text-gray-600">
                  {cat.count} subscription{cat.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">
              ${cat.totalCost.toFixed(2)} (
              {((cat.totalCost / totalCost) * 100).toFixed(1)}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}