import { NextRequest, NextResponse } from 'next/server';
import { CurrencyConverter } from '@/lib/currency-service';
import { getCache, setCache, cacheKeys, CACHE_TTL } from '@/lib/redis-cache-utils';

/**
 * Fetch rates from external API.
 * Falls back to keyless open.er-api.com if key is not configured.
 */
async function fetchLatestRates(): Promise<Record<string, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  let rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
  };

  try {
    if (apiKey) {
      console.log('Fetching exchange rates using EXCHANGE_RATE_API_KEY');
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.result === 'error') {
        throw new Error(`API error: ${data['error-type']}`);
      }

      rates = {
        USD: 1,
        EUR: data.conversion_rates.EUR || 0.92,
        GBP: data.conversion_rates.GBP || 0.79,
        INR: data.conversion_rates.INR || 83.12,
      };
    } else {
      console.log('Fetching exchange rates from public API (no key configured)');
      const response = await fetch('https://open.er-api.com/v6/latest/USD');

      if (!response.ok) {
        throw new Error(`Public API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.result === 'error' || !data.rates) {
        throw new Error('Public API error or invalid rates data');
      }

      rates = {
        USD: 1,
        EUR: data.rates.EUR || 0.92,
        GBP: data.rates.GBP || 0.79,
        INR: data.rates.INR || 83.12,
      };
    }
  } catch (error) {
    console.error('⚠️ Error fetching live rates, using fallback defaults:', error);
  }

  return rates;
}

/**
 * This endpoint updates exchange rates from an external API
 * Can be called manually or via a cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Force fetch rates
    const rates = await fetchLatestRates();

    // Cache the fresh rates in Redis
    try {
      await setCache(cacheKeys.exchangeRates(), rates, CACHE_TTL.EXCHANGE_RATES);
    } catch (cacheError) {
      console.error('⚠️ Redis cache write error for exchange rates:', cacheError);
    }

    // Update rates in service
    CurrencyConverter.updateRates(rates);

    console.log('✅ Exchange rates force-updated:', rates);

    return NextResponse.json(
      {
        success: true,
        message: 'Exchange rates updated successfully',
        data: rates,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error updating exchange rates:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to update exchange rates',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch current rates (cached or live fallback)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Try to get from Redis cache
    let rates: Record<string, number> | null = null;
    try {
      const cached = await getCache(cacheKeys.exchangeRates());
      if (cached) {
        if (typeof cached === 'string') {
          rates = JSON.parse(cached);
        } else if (typeof cached === 'object') {
          rates = cached as Record<string, number>;
        }
      }
    } catch (cacheError) {
      console.error('⚠️ Redis cache read error for exchange rates:', cacheError);
    }

    // 2. If Cache Miss, fetch fresh rates
    if (!rates) {
      rates = await fetchLatestRates();
      
      // 3. Cache the fresh rates in Redis
      try {
        await setCache(cacheKeys.exchangeRates(), rates, CACHE_TTL.EXCHANGE_RATES);
      } catch (cacheError) {
        console.error('⚠️ Redis cache write error for exchange rates:', cacheError);
      }
    }

    // 4. Update memory service
    CurrencyConverter.updateRates(rates);

    const currencies = CurrencyConverter.getSupportedCurrencies();

    return NextResponse.json(
      {
        success: true,
        data: {
          rates,
          currencies,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch exchange rates' },
      },
      { status: 500 }
    );
  }
}