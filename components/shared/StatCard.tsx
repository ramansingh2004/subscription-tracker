'use client';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-lg p-6 border border-opacity-20 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  );
}