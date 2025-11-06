/**
 * Order Block Detector - Custom Study for TradingView Charting Library
 * Based on iSolani's Orderblocks indicator
 *
 * Detects order blocks based on volume imbalance and gap formations
 */

interface OrderBlockStudyContext {
  _context: any;
  _input: any;
  _orderBlocks: Array<{
    top: number;
    bottom: number;
    left: number;
    isBullish: boolean;
  }>;
  init: (context: any, inputCallback: any) => void;
  main: (ctx: any, inputCallback: any) => number[];
}

export function createOrderBlockDetectorStudy(PineJS: any) {
  return {
    name: 'Order Block Detector',
    metainfo: {
      _metainfoVersion: 52,
      id: 'OrderBlockDetector@tv-basicstudies-1',
      description: 'Orderblocks detector',
      shortDescription: 'OB Detector',

      format: {
        type: 'price',
        precision: 2,
      },

      linkedToSeries: true,
      is_price_study: true,
      is_hidden_study: false,

      plots: [
        { id: 'bull_top', type: 'line' },
        { id: 'bull_btm', type: 'line' },
        { id: 'bear_top', type: 'line' },
        { id: 'bear_btm', type: 'line' },
      ],

      filledAreas: [
        {
          id: 'bullish_fill',
          objAId: 'bull_top',
          objBId: 'bull_btm',
          type: 'plot_plot',
          title: 'Bullish OB',
        },
        {
          id: 'bearish_fill',
          objAId: 'bear_top',
          objBId: 'bear_btm',
          type: 'plot_plot',
          title: 'Bearish OB',
        },
      ],

      defaults: {
        styles: {
          bull_top: {
            linestyle: 0,
            linewidth: 1,
            plottype: 2,
            trackPrice: false,
            transparency: 100,
            visible: false,
          },
          bull_btm: {
            linestyle: 0,
            linewidth: 1,
            plottype: 2,
            trackPrice: false,
            transparency: 100,
            visible: false,
          },
          bear_top: {
            linestyle: 0,
            linewidth: 1,
            plottype: 2,
            trackPrice: false,
            transparency: 100,
            visible: false,
          },
          bear_btm: {
            linestyle: 0,
            linewidth: 1,
            plottype: 2,
            trackPrice: false,
            transparency: 100,
            visible: false,
          },
        },

        filledAreasStyle: {
          bullish_fill: {
            color: '#00FF00',
            transparency: 85,
            visible: true,
          },
          bearish_fill: {
            color: '#FF0000',
            transparency: 85,
            visible: true,
          },
        },

        inputs: {
          volumeFilter: 4.0,
          volumeIndexLength: 20,
          volumeMALength: 31,
        },
      },

      styles: {
        bull_top: { title: 'Bullish OB Top', histogramBase: 0 },
        bull_btm: { title: 'Bullish OB Bottom', histogramBase: 0 },
        bear_top: { title: 'Bearish OB Top', histogramBase: 0 },
        bear_btm: { title: 'Bearish OB Bottom', histogramBase: 0 },
      },

      inputs: [
        {
          id: 'volumeFilter',
          name: 'Filter (Volume Multiplier)',
          defval: 4.0,
          type: 'float',
          min: 0.1,
          step: 0.1,
        },
        {
          id: 'volumeIndexLength',
          name: 'Volume Index Length',
          defval: 20,
          type: 'integer',
          min: 1,
          max: 100,
        },
        {
          id: 'volumeMALength',
          name: 'Volume MA Length',
          defval: 31,
          type: 'integer',
          min: 1,
          max: 100,
        },
      ],
    },

    constructor: function (this: OrderBlockStudyContext) {
      this.init = function (this: OrderBlockStudyContext, context: any, inputCallback: any) {
        this._context = context;
        this._input = inputCallback;
        this._orderBlocks = [];
      };

      this.main = function (this: OrderBlockStudyContext, ctx: any, inputCallback: any) {
        this._context = ctx;
        this._input = inputCallback;

        // Get inputs
        const volumeFilter = this._input(0);
        const volumeIndexLength = this._input(1);
        const volumeMALength = this._input(2);

        // Set minimum depth
        this._context.setMinimumAdditionalDepth(Math.max(volumeIndexLength, volumeMALength) + 10);

        // Get current bar data
        const open = PineJS.Std.open(this._context);
        const high = PineJS.Std.high(this._context);
        const low = PineJS.Std.low(this._context);
        const close = PineJS.Std.close(this._context);
        const volume = PineJS.Std.volume(this._context);

        // Create series for historical access
        const open_series = this._context.new_var(open);
        const high_series = this._context.new_var(high);
        const low_series = this._context.new_var(low);
        const close_series = this._context.new_var(close);
        const volume_series = this._context.new_var(volume);

        // Get historical values (offset by 3 bars like in Pine Script)
        const open_3 = open_series.get(3);
        const high_3 = high_series.get(3);
        const low_3 = low_series.get(3);
        const close_3 = close_series.get(3);
        const volume_3 = volume_series.get(3);

        const high_1 = high_series.get(1);
        const low_1 = low_series.get(1);

        // Volume Analysis (from Pine Script)
        const range_3 = high_3 - low_3;
        const buyVolume = range_3 > 0 ? (volume_3 * (close_3 - low_3) / range_3) : 0;
        const sellVolume = range_3 > 0 ? (volume_3 * (high_3 - close_3) / range_3) : 0;

        // Calculate volume difference
        const volumeDifference = Math.abs(buyVolume - sellVolume);

        // Calculate volume moving average
        let volumeDiffSum = 0;
        for (let i = 0; i < volumeMALength; i++) {
          const v = volume_series.get(i + 3);
          const h = high_series.get(i + 3);
          const l = low_series.get(i + 3);
          const c = close_series.get(i + 3);
          const r = h - l;
          if (r > 0) {
            const bv = v * (c - l) / r;
            const sv = v * (h - c) / r;
            volumeDiffSum += Math.abs(bv - sv);
          }
        }
        const averageVolumeDifference = volumeDiffSum / volumeMALength;

        // Check if current bar has high volume difference
        const highVolumeDifference = volumeDifference > (averageVolumeDifference * volumeFilter);

        // Determine if bar is bullish or bearish
        const currentBarBullish = close_3 > open_3;

        // Detect Order Blocks (from Pine Script logic)
        if (highVolumeDifference) {
          if (currentBarBullish && high_3 < low_1) {
            // Bullish order block detected
            this._orderBlocks.push({
              top: high_3,
              bottom: low_3,
              left: this._context.symbol.time,
              isBullish: true,
            });
          } else if (!currentBarBullish && low_3 > high_1) {
            // Bearish order block detected
            this._orderBlocks.push({
              top: high_3,
              bottom: low_3,
              left: this._context.symbol.time,
              isBullish: false,
            });
          }
        }

        // Remove mitigated order blocks
        this._orderBlocks = this._orderBlocks.filter(block => {
          if (block.isBullish) {
            // Bullish block is mitigated if price goes below bottom
            return low >= block.bottom;
          } else {
            // Bearish block is mitigated if price goes above top
            return high <= block.top;
          }
        });

        // Find most recent order block to display
        let bull_top = NaN;
        let bull_btm = NaN;
        let bear_top = NaN;
        let bear_btm = NaN;

        // Get most recent bullish block
        for (let i = this._orderBlocks.length - 1; i >= 0; i--) {
          const block = this._orderBlocks[i];
          if (block.isBullish) {
            bull_top = block.top;
            bull_btm = block.bottom;
            break;
          }
        }

        // Get most recent bearish block
        for (let i = this._orderBlocks.length - 1; i >= 0; i--) {
          const block = this._orderBlocks[i];
          if (!block.isBullish) {
            bear_top = block.top;
            bear_btm = block.bottom;
            break;
          }
        }

        return [bull_top, bull_btm, bear_top, bear_btm];
      };
    },
  };
}

export default createOrderBlockDetectorStudy;
