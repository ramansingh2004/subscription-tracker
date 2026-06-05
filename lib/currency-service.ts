// Exchange rates (base: USD)
// Updated daily via API or manually
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
};

export class CurrencyConverter {
  /**
   * Convert amount from one currency to another
   * @param amount Amount to convert
   * @param fromCurrency Source currency code (e.g., 'USD')
   * @param toCurrency Target currency code (e.g., 'EUR')
   * @returns Converted amount rounded to 2 decimals
   */
  static convert(
    amount: number,
    fromCurrency: string = 'USD',
    toCurrency: string = 'USD'
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromRate = EXCHANGE_RATES[fromCurrency] || EXCHANGE_RATES.USD;
    const toRate = EXCHANGE_RATES[toCurrency] || EXCHANGE_RATES.USD;

    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;

    return Math.round(convertedAmount * 100) / 100;
  }

  /**
   * Format currency with symbol and locale formatting
   * @param amount Amount to format
   * @param currency Currency code
   * @returns Formatted string (e.g., '$99.99')
   */
  static format(amount: number, currency: string = 'USD'): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol} ${formatted}`;
  }

  /**
   * Format currency with code (e.g., 'USD 99.99')
   */
  static formatWithCode(amount: number, currency: string = 'USD'): string {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currency} ${formatted}`;
  }

  /**
   * Get currency symbol
   */
  static getSymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || currency;
  }

  /**
   * Get currency name
   */
  static getName(currency: string): string {
    return CURRENCY_NAMES[currency] || currency;
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies(): Array<{
    code: string;
    symbol: string;
    name: string;
  }> {
    return Object.keys(EXCHANGE_RATES).map((code) => ({
      code,
      symbol: CURRENCY_SYMBOLS[code],
      name: CURRENCY_NAMES[code],
    }));
  }

  /**
   * Update exchange rates (call this daily)
   * You can integrate with a real API like exchangerate-api.com
   */
  static updateRates(newRates: Record<string, number>) {
    Object.assign(EXCHANGE_RATES, newRates);
  }

  /**
   * Get current exchange rates
   */
  static getRates(): Record<string, number> {
    return { ...EXCHANGE_RATES };
  }
}

/**
 * Hook for React components
 */
export const useCurrencyConverter = () => {
  return {
    convert: CurrencyConverter.convert,
    format: CurrencyConverter.format,
    formatWithCode: CurrencyConverter.formatWithCode,
    getSymbol: CurrencyConverter.getSymbol,
    getName: CurrencyConverter.getName,
    getSupportedCurrencies: CurrencyConverter.getSupportedCurrencies,
  };
};