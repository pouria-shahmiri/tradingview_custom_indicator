/**
 * Order Block Calculator
 *
 * Calculates order blocks from bar data for use with TradingView Charting Library
 * Based on LuxAlgo's Order Block Detector algorithm
 *
 * This work is licensed under a Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 * © LuxAlgo
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
<<<<<<< HEAD
 * Calculate highest high over a period ending at endIdx (inclusive)
 * Mimics Pine Script: ta.highest(length)
=======
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
>>>>>>> 5e236731046d3c94a6267ef9cbc84285e4f9edbd
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
 * Calculate lowest low over a period ending at endIdx (inclusive)
 * Mimics Pine Script: ta.lowest(length)
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
 * Find volume pivot highs
 * Mimics Pine Script: ta.pivothigh(volume, length, length)
 */
function findVolumePivotHighs(bars: Bar[], length: number): Map<number, boolean> {
  const pivots = new Map<number, boolean>();

  // We can only check for pivots from index length to bars.length - length - 1
  // because we need 'length' bars on both sides
  for (let i = length; i < bars.length - length; i++) {
    const currentVolume = bars[i].volume || 0;
    let isPivot = true;

    // Check left side
    for (let j = 1; j <= length; j++) {
      const leftVolume = bars[i - j].volume || 0;
      if (currentVolume <= leftVolume) {
        isPivot = false;
        break;
      }
    }

    // Check right side
    if (isPivot) {
      for (let j = 1; j <= length; j++) {
        const rightVolume = bars[i + j].volume || 0;
        if (currentVolume <= rightVolume) {
          isPivot = false;
          break;
        }
      }
    }

    if (isPivot && currentVolume > 0) {
      pivots.set(i, true);
    }
  }

  return pivots;
}

/**
 * Calculate order blocks from bar data
 */
export function calculateOrderBlocks(
  bars: Bar[],
  config: OrderBlockConfig
): { bullishBlocks: OrderBlock[]; bearishBlocks: OrderBlock[] } {
  const { volumePivotLength: length, bullishOBCount, bearishOBCount, mitigationMethod } = config;

  if (bars.length < length * 3) {
    return { bullishBlocks: [], bearishBlocks: [] };
  }

  // Arrays to store order block coordinates (prepend new items to front)
  const bull_top: number[] = [];
  const bull_btm: number[] = [];
  const bull_avg: number[] = [];
  const bull_left: number[] = [];

  const bear_top: number[] = [];
  const bear_btm: number[] = [];
  const bear_avg: number[] = [];
  const bear_left: number[] = [];

  // Calculate market structure oscillator
  // os = 0 (bearish), os = 1 (bullish)
  const os: number[] = new Array(bars.length).fill(0);

  for (let n = length; n < bars.length; n++) {
    // Calculate upper and lower at current bar
    const upper = highest(bars, n, length);
    const lower = lowest(bars, n, length);

    // Market structure logic from Pine Script
    // os := high[length] > upper ? 0 : low[length] < lower ? 1 : os[1]
    const barAtLength = n - length;
    if (barAtLength >= 0) {
      if (bars[barAtLength].high > upper) {
        os[n] = 0; // Bearish
      } else if (bars[barAtLength].low < lower) {
        os[n] = 1; // Bullish
      } else {
        os[n] = os[n - 1]; // Keep previous state
      }
    }
  }

  // Find volume pivot highs
  const volumePivots = findVolumePivotHighs(bars, length);

  // Detect order blocks at volume pivots
  for (let n = length; n < bars.length; n++) {
    const phv = volumePivots.get(n) || false;

    if (phv) {
      // Order block is at bar[length] periods ago from pivot
      const obIdx = n - length;
      if (obIdx < 0) continue;

      const candle = bars[obIdx];
      const hl2 = (candle.high + candle.low) / 2;

      // Bullish order block: formed when os == 1 at pivot
      if (os[n] === 1) {
        const top = hl2;
        const btm = candle.low;
        const avg = (top + btm) / 2;

        // Prepend to arrays (like Pine Script array.unshift)
        bull_top.unshift(top);
        bull_btm.unshift(btm);
        bull_avg.unshift(avg);
        bull_left.unshift(candle.time);
      }

      // Bearish order block: formed when os == 0 at pivot
      if (os[n] === 0) {
        const top = candle.high;
        const btm = hl2;
        const avg = (top + btm) / 2;

        // Prepend to arrays (like Pine Script array.unshift)
        bear_top.unshift(top);
        bear_btm.unshift(btm);
        bear_avg.unshift(avg);
        bear_left.unshift(candle.time);
      }
    }
  }

  // Remove mitigated order blocks
  // For bullish blocks: check if target (low or close) goes below bottom
  // For bearish blocks: check if target (high or close) goes above top

  // Calculate target arrays for mitigation checking
  const target_bull: number[] = [];
  const target_bear: number[] = [];

  for (let i = length; i < bars.length; i++) {
    if (mitigationMethod === 'Close') {
      target_bull[i] = lowest(bars, i, length); // ta.lowest(close, length)
      target_bear[i] = highest(bars, i, length); // ta.highest(close, length)
    } else {
      target_bull[i] = lowest(bars, i, length); // lower (already uses low)
      target_bear[i] = highest(bars, i, length); // upper (already uses high)
    }
  }

  // Remove mitigated bullish order blocks
  const remove_mitigated_bull = (
    ob_top: number[],
    ob_btm: number[],
    ob_left: number[],
    ob_avg: number[],
    isBull: boolean
  ): boolean => {
    let mitigated = false;
    const target_array = isBull ? ob_btm : ob_top;

    // Iterate through a copy of indices to avoid issues while removing
    for (let idx = target_array.length - 1; idx >= 0; idx--) {
      const element = target_array[idx];
      const blockStartTime = ob_left[idx];

      // Find the latest target value after this block was formed
      let latestTarget = isBull ? Infinity : -Infinity;

      for (let i = 0; i < bars.length; i++) {
        if (bars[i].time > blockStartTime) {
          const currentTarget = mitigationMethod === 'Close'
            ? (isBull ? bars[i].close : bars[i].close)
            : (isBull ? bars[i].low : bars[i].high);

          if (isBull) {
            latestTarget = Math.min(latestTarget, currentTarget);
          } else {
            latestTarget = Math.max(latestTarget, currentTarget);
          }
        }
      }

      // Check mitigation condition
      const shouldRemove = isBull
        ? (latestTarget < element)  // For bullish: target < bottom
        : (latestTarget > element); // For bearish: target > top

      if (shouldRemove) {
        mitigated = true;
        ob_top.splice(idx, 1);
        ob_btm.splice(idx, 1);
        ob_avg.splice(idx, 1);
        ob_left.splice(idx, 1);
      }
    }

    return mitigated;
  };

  // Remove mitigated blocks
  remove_mitigated_bull(bull_top, bull_btm, bull_left, bull_avg, true);
  remove_mitigated_bull(bear_top, bear_btm, bear_left, bear_avg, false);

  // Get the latest bar time for extending blocks to the right
  const endTime = bars[bars.length - 1].time;

  // Build final order block arrays (keeping only the most recent ones)
  const bullishBlocks: OrderBlock[] = [];
  const bearishBlocks: OrderBlock[] = [];

  // Get up to bullishOBCount most recent bullish blocks
  const bullCount = Math.min(bullishOBCount, bull_top.length);
  for (let i = 0; i < bullCount; i++) {
    bullishBlocks.push({
      top: bull_top[i],
      bottom: bull_btm[i],
      average: bull_avg[i],
      startTime: bull_left[i],
      endTime: endTime,
      type: 'bullish',
    });
  }

  // Get up to bearishOBCount most recent bearish blocks
  const bearCount = Math.min(bearishOBCount, bear_top.length);
  for (let i = 0; i < bearCount; i++) {
    bearishBlocks.push({
      top: bear_top[i],
      bottom: bear_btm[i],
      average: bear_avg[i],
      startTime: bear_left[i],
      endTime: endTime,
      type: 'bearish',
    });
  }

  return {
    bullishBlocks,
    bearishBlocks,
  };
}
