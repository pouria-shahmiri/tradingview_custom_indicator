import type { CandlestickData, Time } from 'lightweight-charts';

/**
 * Generates sample candlestick data for testing
 * This creates realistic-looking price data with some randomness
 *
 * @param numberOfDays - Number of days of data to generate
 * @param basePrice - Starting price
 * @returns Array of candlestick data
 */
export function generateSampleData(
  numberOfDays: number = 100,
  basePrice: number = 100
): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numberOfDays);

  let currentPrice = basePrice;

  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate daily price movement
    const volatility = 0.02; // 2% daily volatility
    const trend = 0.0005; // Slight upward trend
    const randomChange = (Math.random() - 0.5) * volatility * currentPrice;
    const trendChange = trend * currentPrice;

    // Calculate OHLC values
    const open = currentPrice;
    const close = currentPrice + randomChange + trendChange;

    // High is the maximum of open and close, plus some random amount
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);

    // Low is the minimum of open and close, minus some random amount
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    data.push({
      time: (date.getTime() / 1000) as Time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}
