import type { CandlestickData, Time } from 'lightweight-charts';

/**
 * Simple Moving Average (SMA) Indicator
 *
 * Calculates the simple moving average of closing prices over a specified period.
 *
 * @param data - Array of candlestick data
 * @param period - Number of periods to calculate the average (default: 20)
 * @returns Array of time-value pairs representing the SMA line
 */
export function simpleMovingAverage(
  data: CandlestickData<Time>[],
  period: number = 20
): { time: Time; value: number }[] {
  const result: { time: Time; value: number }[] = [];

  // We need at least 'period' data points to start calculating
  if (data.length < period) {
    return result;
  }

  for (let i = period - 1; i < data.length; i++) {
    // Calculate sum of closing prices for the period
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }

    // Calculate average
    const average = sum / period;

    result.push({
      time: data[i].time,
      value: average,
    });
  }

  return result;
}

/**
 * Exponential Moving Average (EMA) Indicator
 *
 * Calculates the exponential moving average of closing prices over a specified period.
 * EMA gives more weight to recent prices.
 *
 * @param data - Array of candlestick data
 * @param period - Number of periods to calculate the average (default: 20)
 * @returns Array of time-value pairs representing the EMA line
 */
export function exponentialMovingAverage(
  data: CandlestickData<Time>[],
  period: number = 20
): { time: Time; value: number }[] {
  const result: { time: Time; value: number }[] = [];

  if (data.length < period) {
    return result;
  }

  // Calculate multiplier
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA as the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  result.push({
    time: data[period - 1].time,
    value: ema,
  });

  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      time: data[i].time,
      value: ema,
    });
  }

  return result;
}

/**
 * Relative Strength Index (RSI) Indicator
 *
 * Calculates the RSI, which measures the magnitude of recent price changes
 * to evaluate overbought or oversold conditions.
 *
 * @param data - Array of candlestick data
 * @param period - Number of periods to calculate RSI (default: 14)
 * @returns Array of time-value pairs representing the RSI line
 */
export function relativeStrengthIndex(
  data: CandlestickData<Time>[],
  period: number = 14
): { time: Time; value: number }[] {
  const result: { time: Time; value: number }[] = [];

  if (data.length < period + 1) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for the first point
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  result.push({
    time: data[period].time,
    value: rsi,
  });

  // Calculate RSI for remaining data points using smoothed averages
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i].time,
      value: rsi,
    });
  }

  return result;
}
