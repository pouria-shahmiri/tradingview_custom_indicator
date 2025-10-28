import type { CandlestickData, Time } from 'lightweight-charts';

/**
 * Order Block Detector [LuxAlgo]
 *
 * This indicator detects and visualizes order blocks based on volume pivots.
 * Converted from Pine Script to TypeScript
 *
 * Original: https://www.tradingview.com/script/...
 * License: Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 */

export interface OrderBlock {
  top: number;
  bottom: number;
  average: number;
  leftTime: Time;
  type: 'bullish' | 'bearish';
}

export interface OrderBlockDetectorOptions {
  volumePivotLength?: number;
  bullishOBCount?: number;
  bearishOBCount?: number;
  mitigationMethod?: 'Wick' | 'Close';
}

export interface OrderBlockDetectorResult {
  bullishBlocks: OrderBlock[];
  bearishBlocks: OrderBlock[];
  bullishOBPoints: { time: Time; value: number }[];
  bearishOBPoints: { time: Time; value: number }[];
  mitigatedBullish: boolean;
  mitigatedBearish: boolean;
}

/**
 * Helper function to find pivot highs in volume
 */
function findVolumePivotHighs(
  data: CandlestickData<Time>[],
  length: number
): Set<number> {
  const pivots = new Set<number>();

  for (let i = length; i < data.length - length; i++) {
    const currentVolume = (data[i] as any).volume || 0;
    let isPivot = true;

    // Check if current volume is higher than surrounding volumes
    for (let j = 1; j <= length; j++) {
      const leftVolume = (data[i - j] as any).volume || 0;
      const rightVolume = (data[i + j] as any).volume || 0;

      if (currentVolume <= leftVolume || currentVolume <= rightVolume) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && currentVolume > 0) {
      pivots.add(i);
    }
  }

  return pivots;
}

/**
 * Helper function to calculate highest high over a period
 */
function highest(data: CandlestickData<Time>[], endIdx: number, length: number): number {
  let max = -Infinity;
  const startIdx = Math.max(0, endIdx - length + 1);

  for (let i = startIdx; i <= endIdx; i++) {
    if (data[i].high > max) {
      max = data[i].high;
    }
  }

  return max;
}

/**
 * Helper function to calculate lowest low over a period
 */
function lowest(data: CandlestickData<Time>[], endIdx: number, length: number): number {
  let min = Infinity;
  const startIdx = Math.max(0, endIdx - length + 1);

  for (let i = startIdx; i <= endIdx; i++) {
    if (data[i].low < min) {
      min = data[i].low;
    }
  }

  return min;
}

/**
 * Determine market structure (oscillator state)
 * Returns 0 for bearish, 1 for bullish
 */
function calculateMarketStructure(
  data: CandlestickData<Time>[],
  length: number
): number[] {
  const os: number[] = new Array(data.length).fill(0);

  for (let i = length; i < data.length; i++) {
    const upper = highest(data, i - 1, length);
    const lower = lowest(data, i - 1, length);

    if (data[i - length].high > upper) {
      os[i] = 0; // Bearish
    } else if (data[i - length].low < lower) {
      os[i] = 1; // Bullish
    } else {
      os[i] = os[i - 1]; // Keep previous state
    }
  }

  return os;
}

/**
 * Main Order Block Detector function
 */
export function orderBlockDetector(
  data: CandlestickData<Time>[],
  options: OrderBlockDetectorOptions = {}
): OrderBlockDetectorResult {
  const {
    volumePivotLength = 5,
    bullishOBCount = 3,
    bearishOBCount = 3,
    mitigationMethod = 'Wick',
  } = options;

  const bullishBlocks: OrderBlock[] = [];
  const bearishBlocks: OrderBlock[] = [];
  const bullishOBPoints: { time: Time; value: number }[] = [];
  const bearishOBPoints: { time: Time; value: number }[] = [];

  // Find volume pivot highs
  const volumePivots = findVolumePivotHighs(data, volumePivotLength);

  // Calculate market structure
  const marketStructure = calculateMarketStructure(data, volumePivotLength);

  // Detect order blocks at volume pivots
  for (const pivotIdx of volumePivots) {
    const obIdx = pivotIdx - volumePivotLength;
    if (obIdx < 0 || obIdx >= data.length) continue;

    const candle = data[obIdx];
    const hl2 = (candle.high + candle.low) / 2;

    // Bullish order block (formed during uptrend)
    if (marketStructure[pivotIdx] === 1) {
      const block: OrderBlock = {
        top: hl2,
        bottom: candle.low,
        average: (hl2 + candle.low) / 2,
        leftTime: candle.time,
        type: 'bullish',
      };

      bullishBlocks.push(block);
      bullishOBPoints.push({
        time: candle.time,
        value: candle.low,
      });
    }

    // Bearish order block (formed during downtrend)
    if (marketStructure[pivotIdx] === 0) {
      const block: OrderBlock = {
        top: candle.high,
        bottom: hl2,
        average: (candle.high + hl2) / 2,
        leftTime: candle.time,
        type: 'bearish',
      };

      bearishBlocks.push(block);
      bearishOBPoints.push({
        time: candle.time,
        value: candle.high,
      });
    }
  }

  // Remove mitigated order blocks
  let mitigatedBullish = false;
  let mitigatedBearish = false;

  // Check mitigation for bullish blocks
  for (let i = bullishBlocks.length - 1; i >= 0; i--) {
    const block = bullishBlocks[i];

    for (let j = 0; j < data.length; j++) {
      if (data[j].time <= block.leftTime) continue;

      const target = mitigationMethod === 'Close'
        ? data[j].close
        : data[j].low;

      if (target < block.bottom) {
        bullishBlocks.splice(i, 1);
        mitigatedBullish = true;
        break;
      }
    }
  }

  // Check mitigation for bearish blocks
  for (let i = bearishBlocks.length - 1; i >= 0; i--) {
    const block = bearishBlocks[i];

    for (let j = 0; j < data.length; j++) {
      if (data[j].time <= block.leftTime) continue;

      const target = mitigationMethod === 'Close'
        ? data[j].close
        : data[j].high;

      if (target > block.top) {
        bearishBlocks.splice(i, 1);
        mitigatedBearish = true;
        break;
      }
    }
  }

  // Keep only the most recent order blocks
  const recentBullishBlocks = bullishBlocks.slice(-bullishOBCount);
  const recentBearishBlocks = bearishBlocks.slice(-bearishOBCount);

  return {
    bullishBlocks: recentBullishBlocks,
    bearishBlocks: recentBearishBlocks,
    bullishOBPoints,
    bearishOBPoints,
    mitigatedBullish,
    mitigatedBearish,
  };
}
