/**
 * Order Block Detector Implementation
 * Draws order blocks using TradingView's Shape API
 */

interface OrderBlock {
  top: number;
  bottom: number;
  left: number;
  color: string;
  type: 'bullish' | 'bearish';
  shapeId?: string;
}

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class OrderBlockDetector {
  private chart: any;
  private volumePivotLength: number = 5;
  private bullishOBCount: number = 3;
  private bearishOBCount: number = 3;
  private mitigationMethod: 'wick' | 'close' = 'wick';

  private bars: Bar[] = [];
  private bullishBlocks: OrderBlock[] = [];
  private bearishBlocks: OrderBlock[] = [];
  private os: number = 0;

  constructor(chart: any) {
    this.chart = chart;
  }

  setParameters(params: {
    volumePivotLength?: number;
    bullishOBCount?: number;
    bearishOBCount?: number;
    mitigationMethod?: 'wick' | 'close';
  }) {
    if (params.volumePivotLength) this.volumePivotLength = params.volumePivotLength;
    if (params.bullishOBCount) this.bullishOBCount = params.bullishOBCount;
    if (params.bearishOBCount) this.bearishOBCount = params.bearishOBCount;
    if (params.mitigationMethod) this.mitigationMethod = params.mitigationMethod;
  }

  addBar(bar: Bar) {
    this.bars.push(bar);
    this.detectOrderBlocks();
    this.checkMitigation();
    this.drawOrderBlocks();
  }

  private detectOrderBlocks() {
    if (this.bars.length < this.volumePivotLength * 2 + 1) return;

    const idx = this.bars.length - this.volumePivotLength - 1;
    if (idx < this.volumePivotLength) return;

    const length = this.volumePivotLength;

    // Calculate highest and lowest
    let upper = -Infinity;
    let lower = Infinity;

    for (let i = 0; i < this.bars.length; i++) {
      if (this.bars[i].high > upper) upper = this.bars[i].high;
      if (this.bars[i].low < lower) lower = this.bars[i].low;
    }

    // Check order structure
    const pastHigh = this.bars[idx].high;
    const pastLow = this.bars[idx].low;

    if (pastHigh > upper) {
      this.os = 0; // Bearish
    } else if (pastLow < lower) {
      this.os = 1; // Bullish
    }

    // Check if it's a volume pivot
    const currentVolume = this.bars[idx].volume;
    let isPivot = true;

    for (let i = 1; i <= length; i++) {
      if (idx - i >= 0 && currentVolume <= this.bars[idx - i].volume) {
        isPivot = false;
        break;
      }
      if (idx + i < this.bars.length && currentVolume <= this.bars[idx + i].volume) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && currentVolume > 0) {
      const obHigh = this.bars[idx].high;
      const obLow = this.bars[idx].low;
      const obHl2 = (obHigh + obLow) / 2;

      if (this.os === 1) {
        // Bullish order block
        const block: OrderBlock = {
          top: obHl2,
          bottom: obLow,
          left: this.bars[idx].time,
          color: 'rgba(8, 153, 129, 0.2)',
          type: 'bullish',
        };

        this.bullishBlocks.unshift(block);
        if (this.bullishBlocks.length > this.bullishOBCount) {
          this.bullishBlocks.pop();
        }
      }

      if (this.os === 0) {
        // Bearish order block
        const block: OrderBlock = {
          top: obHigh,
          bottom: obHl2,
          left: this.bars[idx].time,
          color: 'rgba(242, 54, 69, 0.2)',
          type: 'bearish',
        };

        this.bearishBlocks.unshift(block);
        if (this.bearishBlocks.length > this.bearishOBCount) {
          this.bearishBlocks.pop();
        }
      }
    }
  }

  private checkMitigation() {
    if (this.bars.length === 0) return;

    const lastBar = this.bars[this.bars.length - 1];
    const target = this.mitigationMethod === 'close'
      ? lastBar.close
      : (this.os === 1 ? lastBar.low : lastBar.high);

    // Check bullish blocks
    this.bullishBlocks = this.bullishBlocks.filter(block => {
      return target >= block.bottom;
    });

    // Check bearish blocks
    this.bearishBlocks = this.bearishBlocks.filter(block => {
      return target <= block.top;
    });
  }

  private drawOrderBlocks() {
    // Clear previous drawings would go here if we track shape IDs

    // Draw bullish blocks
    this.bullishBlocks.forEach(block => {
      this.drawBox(block);
    });

    // Draw bearish blocks
    this.bearishBlocks.forEach(block => {
      this.drawBox(block);
    });
  }

  private drawBox(block: OrderBlock) {
    try {
      if (!this.chart || !this.chart.createMultipointShape) return;

      const currentTime = this.bars.length > 0 ? this.bars[this.bars.length - 1].time : Date.now();

      // Create a rectangle shape
      const points = [
        { time: block.left / 1000, price: block.top },
        { time: currentTime / 1000, price: block.bottom },
      ];

      const shapeOptions = {
        shape: 'rectangle',
        lock: false,
        disableSelection: true,
        disableSave: true,
        disableUndo: true,
        overrides: {
          backgroundColor: block.color,
          borderColor: block.type === 'bullish' ? '#089981' : '#F23645',
          borderWidth: 1,
          extendRight: true,
          filled: true,
        },
      };

      this.chart.createMultipointShape(points, shapeOptions);
    } catch (error) {
      console.error('Error drawing order block:', error);
    }
  }

  clearAll() {
    this.bullishBlocks = [];
    this.bearishBlocks = [];
    this.bars = [];
  }
}
