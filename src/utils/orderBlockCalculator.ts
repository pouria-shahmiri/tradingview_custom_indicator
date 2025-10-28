/**
 * Order Block Calculator
 *
 * Calculates order blocks from bar data for use with TradingView Charting Library
 * Based on LuxAlgo's Order Block Detector algorithm
 */

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface OrderBlock {
  top: number;
  bottom: number;
  average: number;
  startTime: number;
  endTime: number;
  type: 'bullish' | 'bearish';
}

export interface OrderBlockConfig {
  volumePivotLength: number;
  bullishOBCount: number;
  bearishOBCount: number;
  mitigationMethod: 'Wick' | 'Close';
}

/**
 * Find volume pivot highs
 */
function findVolumePivotHighs(bars: Bar[], length: number): Set<number> {
  const pivots = new Set<number>();

  for (let i = length; i < bars.length - length; i++) {
    const currentVolume = bars[i].volume || 0;
    let isPivot = true;

    for (let j = 1; j <= length; j++) {
      const leftVolume = bars[i - j].volume || 0;
      const rightVolume = bars[i + j].volume || 0;

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
 * Calculate highest high over a period
 */
function highest(bars: Bar[], endIdx: number, length: number): number {
  let max = -Infinity;
  const startIdx = Math.max(0, endIdx - length + 1);

  for (let i = startIdx; i <= endIdx; i++) {
    if (bars[i].high > max) {
      max = bars[i].high;
    }
  }

  return max;
}

/**
 * Calculate lowest low over a period
 */
function lowest(bars: Bar[], endIdx: number, length: number): number {
  let min = Infinity;
  const startIdx = Math.max(0, endIdx - length + 1);

  for (let i = startIdx; i <= endIdx; i++) {
    if (bars[i].low < min) {
      min = bars[i].low;
    }
  }

  return min;
}

/**
 * Determine market structure (oscillator state)
 * Returns 0 for bearish, 1 for bullish
 */
function calculateMarketStructure(bars: Bar[], length: number): number[] {
  const os: number[] = new Array(bars.length).fill(0);

  for (let i = length; i < bars.length; i++) {
    const upper = highest(bars, i - 1, length);
    const lower = lowest(bars, i - 1, length);

    // Check if current bar breaks above recent highs or below recent lows
    if (bars[i].close > upper) {
      os[i] = 1; // Bullish - broke above recent highs
    } else if (bars[i].close < lower) {
      os[i] = 0; // Bearish - broke below recent lows
    } else {
      os[i] = os[i - 1]; // Keep previous state
    }
  }

  return os;
}

/**
 * Calculate order blocks from bar data
 */
export function calculateOrderBlocks(
  bars: Bar[],
  config: OrderBlockConfig
): { bullishBlocks: OrderBlock[]; bearishBlocks: OrderBlock[] } {
  const { volumePivotLength, bullishOBCount, bearishOBCount, mitigationMethod } = config;

  const bullishBlocks: OrderBlock[] = [];
  const bearishBlocks: OrderBlock[] = [];

  if (bars.length < volumePivotLength * 2) {
    return { bullishBlocks, bearishBlocks };
  }

  // Find volume pivot highs
  const volumePivots = findVolumePivotHighs(bars, volumePivotLength);

  // Calculate market structure
  const marketStructure = calculateMarketStructure(bars, volumePivotLength);

  // Get the latest bar time for extending blocks to the right
  const endTime = bars[bars.length - 1].time;

  // Detect order blocks at volume pivots
  for (const pivotIdx of Array.from(volumePivots)) {
    const obIdx = pivotIdx - volumePivotLength;
    if (obIdx < 0 || obIdx >= bars.length) continue;

    const candle = bars[obIdx];
    const hl2 = (candle.high + candle.low) / 2;

    // Bullish order block (formed during bearish structure/downtrend, acts as support)
    if (marketStructure[pivotIdx] === 0) {
      const block: OrderBlock = {
        top: hl2,
        bottom: candle.low,
        average: (hl2 + candle.low) / 2,
        startTime: candle.time,
        endTime: endTime,
        type: 'bullish',
      };

      bullishBlocks.push(block);
    }

    // Bearish order block (formed during bullish structure/uptrend, acts as resistance)
    if (marketStructure[pivotIdx] === 1) {
      const block: OrderBlock = {
        top: candle.high,
        bottom: hl2,
        average: (candle.high + hl2) / 2,
        startTime: candle.time,
        endTime: endTime,
        type: 'bearish',
      };

      bearishBlocks.push(block);
    }
  }

  // Remove mitigated order blocks
  // Check mitigation for bullish blocks
  for (let i = bullishBlocks.length - 1; i >= 0; i--) {
    const block = bullishBlocks[i];

    for (let j = 0; j < bars.length; j++) {
      if (bars[j].time <= block.startTime) continue;

      const target = mitigationMethod === 'Close' ? bars[j].close : bars[j].low;

      if (target < block.bottom) {
        bullishBlocks.splice(i, 1);
        break;
      }
    }
  }

  // Check mitigation for bearish blocks
  for (let i = bearishBlocks.length - 1; i >= 0; i--) {
    const block = bearishBlocks[i];

    for (let j = 0; j < bars.length; j++) {
      if (bars[j].time <= block.startTime) continue;

      const target = mitigationMethod === 'Close' ? bars[j].close : bars[j].high;

      if (target > block.top) {
        bearishBlocks.splice(i, 1);
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
  };
}
