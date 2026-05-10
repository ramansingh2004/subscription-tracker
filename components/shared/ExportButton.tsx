'use client';

import { useState } from 'react';
import { ISubscription } from '@/typesDefined/index';
import ExportService from '@/lib/export-service';
import toast from 'react-hot-toast';

interface Props {
  subscriptions: ISubscription[];
  filename?: string;
}

export function ExportButton({ subscriptions, filename = 'subscriptions' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'txt') => {
    setIsExporting(true);
    try {
      const timestampedFilename = ExportService.getTimestampedFilename(
        `${filename}.${format === 'txt' ? 'txt' : format}`
      );

      if (format === 'csv') {
        ExportService.exportToCSV(subscriptions, timestampedFilename);
      } else if (format === 'json') {
        ExportService.exportToJSON(subscriptions, timestampedFilename);
      } else if (format === 'txt') {
        ExportService.exportSummaryReport(subscriptions, timestampedFilename);
      }

      toast.success(`Exported ${subscriptions.length} subscriptions as ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
        disabled={isExporting}
      >
        📥 Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50"
          >
            📄 Export as CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition border-t border-gray-200 disabled:opacity-50"
          >
            📋 Export as JSON
          </button>
          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition border-t border-gray-200 disabled:opacity-50"
          >
            📝 Export Summary Report
          </button>
        </div>
      )}
    </div>
  );
}