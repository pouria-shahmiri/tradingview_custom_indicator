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
 * Weighted Moving Average (WMA) Helper
 * Calculates WMA from an array of values
 */
function wmaFromValues(values: number[], length: number): number {
  if (values.length < length) return 0;

  let sum = 0;
  let weightSum = 0;

  for (let i = 0; i < length; i++) {
    const weight = length - i;
    sum += values[values.length - 1 - i] * weight;
    weightSum += weight;
  }

  return sum / weightSum;
}

/**
 * Exponential Moving Average Helper
 * Calculates EMA from an array of values
 */
function emaFromValues(values: number[], length: number): number[] {
  if (values.length < length) return [];

  const multiplier = 2 / (length + 1);
  const result: number[] = [];

  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += values[i];
  }
  let ema = sum / length;
  result.push(ema);

  // Calculate EMA for remaining values
  for (let i = length; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
}

/**
 * Hull Moving Average (HMA)
 * HMA = WMA(2 * WMA(src, length/2) - WMA(src, length), sqrt(length))
 */
function calculateHMA(closeValues: number[], length: number): number[] {
  const result: number[] = [];
  const sqrtLength = Math.round(Math.sqrt(length));
  const halfLength = Math.floor(length / 2);

  for (let i = length - 1; i < closeValues.length; i++) {
    const dataSlice = closeValues.slice(0, i + 1);

    // Calculate WMA(src, length/2)
    const wma1 = wmaFromValues(dataSlice, halfLength);

    // Calculate WMA(src, length)
    const wma2 = wmaFromValues(dataSlice, length);

    // Calculate 2 * WMA(src, length/2) - WMA(src, length)
    const diff = 2 * wma1 - wma2;

    // Build array for final WMA calculation
    result.push(diff);
  }

  // Now calculate WMA of the result with sqrt(length)
  const finalResult: number[] = [];
  for (let i = sqrtLength - 1; i < result.length; i++) {
    const hma = wmaFromValues(result.slice(0, i + 1), sqrtLength);
    finalResult.push(hma);
  }

  return finalResult;
}

/**
 * Exponential Hull Moving Average (EHMA)
 * EHMA = EMA(2 * EMA(src, length/2) - EMA(src, length), sqrt(length))
 */
function calculateEHMA(closeValues: number[], length: number): number[] {
  const sqrtLength = Math.round(Math.sqrt(length));
  const halfLength = Math.floor(length / 2);

  // Calculate EMA(src, length/2)
  const ema1 = emaFromValues(closeValues, halfLength);

  // Calculate EMA(src, length)
  const ema2 = emaFromValues(closeValues, length);

  // Calculate 2 * EMA1 - EMA2
  const diff: number[] = [];

  for (let i = 0; i < Math.min(ema1.length, ema2.length); i++) {
    diff.push(2 * ema1[i] - ema2[i]);
  }

  // Calculate final EMA with sqrt(length)
  const finalEma = emaFromValues(diff, sqrtLength);

  return finalEma;
}

/**
 * Triple Hull Moving Average (THMA)
 * THMA = WMA(WMA(src, length/3) * 3 - WMA(src, length/2) - WMA(src, length), length)
 */
function calculateTHMA(closeValues: number[], length: number): number[] {
  const result: number[] = [];
  const thirdLength = Math.floor(length / 3);
  const halfLength = Math.floor(length / 2);

  for (let i = length - 1; i < closeValues.length; i++) {
    const dataSlice = closeValues.slice(0, i + 1);

    // Calculate WMA(src, length/3)
    const wma1 = wmaFromValues(dataSlice, thirdLength);

    // Calculate WMA(src, length/2)
    const wma2 = wmaFromValues(dataSlice, halfLength);

    // Calculate WMA(src, length)
    const wma3 = wmaFromValues(dataSlice, length);

    // Calculate WMA1 * 3 - WMA2 - WMA3
    const diff = wma1 * 3 - wma2 - wma3;

    result.push(diff);
  }

  // Calculate final WMA with length
  const finalResult: number[] = [];
  for (let i = length - 1; i < result.length; i++) {
    const thma = wmaFromValues(result.slice(0, i + 1), length);
    finalResult.push(thma);
  }

  return finalResult;
}

export type HullSuiteMode = 'Hma' | 'Ehma' | 'Thma';

export interface HullSuiteOptions {
  mode?: HullSuiteMode;
  length?: number;
  lengthMult?: number;
}

export interface HullSuiteResult {
  main: { time: Time; value: number }[];
  shifted: { time: Time; value: number }[];
  colors: string[];
}

/**
 * Hull Suite Indicator
 * Based on "Hull Suite by InSilico" Pine Script
 *
 * Provides main hull line, shifted hull line (2 bars back), and trend colors
 *
 * @param data - Array of candlestick data
 * @param options - Configuration options
 * @returns Object containing main line, shifted line, and colors
 */
export function hullSuite(
  data: CandlestickData<Time>[],
  options: HullSuiteOptions = {}
): HullSuiteResult {
  const {
    mode = 'Hma',
    length = 55,
    lengthMult = 1.0,
  } = options;

  const effectiveLength = Math.floor(length * lengthMult);
  const closeValues = data.map(d => d.close);

  let hullValues: number[] = [];

  // Calculate hull based on mode
  switch (mode) {
    case 'Hma':
      hullValues = calculateHMA(closeValues, effectiveLength);
      break;
    case 'Ehma':
      hullValues = calculateEHMA(closeValues, effectiveLength);
      break;
    case 'Thma':
      hullValues = calculateTHMA(closeValues, Math.floor(effectiveLength / 2));
      break;
  }

  const main: { time: Time; value: number }[] = [];
  const shifted: { time: Time; value: number }[] = [];
  const colors: string[] = [];

  // Map hull values back to data points
  const startIdx = data.length - hullValues.length;

  for (let i = 0; i < hullValues.length; i++) {
    const dataIdx = startIdx + i;

    // Main hull (MHULL = HULL[0])
    main.push({
      time: data[dataIdx].time,
      value: hullValues[i],
    });

    // Shifted hull (SHULL = HULL[2])
    if (i >= 2) {
      shifted.push({
        time: data[dataIdx].time,
        value: hullValues[i - 2],
      });

      // Determine color based on trend
      const color = hullValues[i] > hullValues[i - 2] ? '#00ff00' : '#ff0000';
      colors.push(color);
    }
  }

  return { main, shifted, colors };
}
