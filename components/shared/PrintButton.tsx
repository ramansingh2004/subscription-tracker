'use client';

import { ISubscription } from '@/typesDefined/index';
import toast from 'react-hot-toast';

interface Props {
  subscriptions: ISubscription[];
}

export function PrintButton({ subscriptions }: Props) {
  const handlePrint = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Subscriptions Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #1f2937;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #1f2937;
      margin-top: 30px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .summary {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
    .summary-item {
      margin: 5px 0;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <h1>📋 Subscriptions Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>

  <div class="summary">
    <h3>Summary</h3>
    <div class="summary-item">
      <strong>Total Subscriptions:</strong> ${subscriptions.length}
    </div>
    <div class="summary-item">
      <strong>Active:</strong> ${subscriptions.filter((s) => s.status === 'active').length}
    </div>
    <div class="summary-item">
      <strong>Monthly Cost:</strong> $${subscriptions
        .reduce((sum, sub) => {
          if (sub.status !== 'active') return sum;
          if (sub.billingCycle === 'monthly') return sum + sub.cost;
          if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
          if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
          return sum;
        }, 0)
        .toFixed(2)}
    </div>
  </div>

  <h2>Subscription Details</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Cost</th>
        <th>Billing</th>
        <th>Next Renewal</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${subscriptions
        .map(
          (sub) => `
        <tr>
          <td>${sub.name}</td>
          <td>${sub.category}</td>
          <td>$${sub.cost.toFixed(2)}</td>
          <td>${sub.billingCycle}</td>
          <td>${new Date(sub.nextRenewalDate).toLocaleDateString()}</td>
          <td>${sub.status}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    const newWindow = window.open('', '', 'width=900,height=700');
    if (newWindow) {
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
      toast.success('Opened print preview');
    } else {
      toast.error('Could not open print preview');
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
    >
      🖨️ Print
    </button>
  );
}