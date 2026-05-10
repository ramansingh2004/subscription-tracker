import { ISubscription } from '@/typesDefined/index';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeFields?: string[];
  filename?: string;
}

class ExportService {
  /**
   * Export subscriptions to CSV
   */
  static exportToCSV(subscriptions: ISubscription[], filename: string = 'subscriptions.csv') {
    const headers = [
      'Name',
      'Category',
      'Cost',
      'Billing Cycle',
      'Next Renewal',
      'Status',
      'Auto Renew',
      'Notes',
    ];

    const rows = subscriptions.map((sub) => [
      sub.name,
      sub.category,
      `$${sub.cost.toFixed(2)}`,
      sub.billingCycle,
      new Date(sub.nextRenewalDate).toLocaleDateString(),
      sub.status,
      sub.autoRenew ? 'Yes' : 'No',
      sub.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export subscriptions to JSON
   */
  static exportToJSON(subscriptions: ISubscription[], filename: string = 'subscriptions.json') {
    const json = JSON.stringify(subscriptions, null, 2);
    this.downloadFile(json, filename, 'application/json');
  }

  /**
   * Export summary report
   */
  static exportSummaryReport(
    subscriptions: ISubscription[],
    filename: string = 'subscription-summary.txt'
  ) {
    const totalMonthly = subscriptions.reduce((sum, sub) => {
      if (sub.status !== 'active') return sum;
      if (sub.billingCycle === 'monthly') return sum + sub.cost;
      if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
      if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
      return sum;
    }, 0);

    const totalYearly = totalMonthly * 12;

    const report = `
SUBSCRIPTION SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

OVERVIEW
--------
Total Subscriptions: ${subscriptions.length}
Active: ${subscriptions.filter((s) => s.status === 'active').length}
Paused: ${subscriptions.filter((s) => s.status === 'paused').length}
Cancelled: ${subscriptions.filter((s) => s.status === 'cancelled').length}

SPENDING
--------
Monthly Cost: $${totalMonthly.toFixed(2)}
Yearly Cost: $${totalYearly.toFixed(2)}

SUBSCRIPTIONS
--------
${subscriptions
  .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime())
  .map(
    (sub) => `
${sub.name}
  Category: ${sub.category}
  Cost: $${sub.cost.toFixed(2)} (${sub.billingCycle})
  Status: ${sub.status}
  Next Renewal: ${new Date(sub.nextRenewalDate).toLocaleDateString()}
`
  )
  .join('\n')}
    `.trim();

    this.downloadFile(report, filename, 'text/plain');
  }

  /**
   * Helper to download file
   */
  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename with timestamp
   */
  static getTimestampedFilename(baseFilename: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const [name, ext] = baseFilename.split('.');
    return `${name}_${timestamp}.${ext}`;
  }
}

export default ExportService;