import { NextRequest, NextResponse } from 'next/server';
import { CurrencyConverter } from '@/lib/currency-service';

/**
 * This endpoint updates exchange rates from an external API
 * Can be called manually or via a cron job
 * 
 * Supported APIs:
 * - exchangerate-api.com (free tier: 1500 requests/month)
 * - openexchangerates.org (free tier: 1000 requests/month)
 * - fixer.io (free tier: 100 requests/month)
 * - polygon.io (crypto + forex)
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

    // Get rates from external API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ EXCHANGE_RATE_API_KEY not configured, using cached rates');
      return NextResponse.json(
        {
          success: true,
          message: 'Using cached rates (API key not configured)',
          data: CurrencyConverter.getRates(),
        },
        { status: 200 }
      );
    }

    // Fetch from exchangerate-api.com
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.result === 'error') {
      throw new Error(`API error: ${data['error-type']}`);
    }

    // Extract rates for our supported currencies
    const rates: Record<string, number> = {
      USD: 1,
      EUR: data.conversion_rates.EUR,
      GBP: data.conversion_rates.GBP,
      INR: data.conversion_rates.INR,
    };

    // Update rates in service
    CurrencyConverter.updateRates(rates);

    console.log('✅ Exchange rates updated:', rates);

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
 * GET endpoint to fetch current rates (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const rates = CurrencyConverter.getRates();
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
        error: { message: error.message },
      },
      { status: 500 }
    );
  }
}