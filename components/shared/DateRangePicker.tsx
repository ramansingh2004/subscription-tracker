'use client';

import { useState } from 'react';

interface Props {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ onDateRangeChange }: Props) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState(new Date());

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate);
    onDateRangeChange(newDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setEndDate(newDate);
    onDateRangeChange(startDate, newDate);
  };

  const presetRanges = [
    {
      label: 'Last 7 days',
      getDates: () => {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        return [start, end];
      },
    },
    {
      label: 'Last 30 days',
      getDates: () => {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return [start, end];
      },
    },
    {
      label: 'Last 90 days',
      getDates: () => {
        const end = new Date();
        const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        return [start, end];
      },
    },
    {
      label: 'This year',
      getDates: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        return [start, end];
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Date Range</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presetRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => {
              const [start, end] = range.getDates();
              setStartDate(start);
              setEndDate(end);
              onDateRangeChange(start, end);
            }}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition font-medium"
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}