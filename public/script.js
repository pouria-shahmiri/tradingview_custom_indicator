/**
 * Order Block Detector - TradingView Custom Indicator
 * Based on LuxAlgo's Order Block Detector algorithm
 */

function initOnReady() {
  var widget = (window.tvWidget = new TradingView.widget({
    library_path:
      "https://charting-library.tradingview-widget.com/charting_library/",
    // debug: true, // uncomment this line to see Library errors and warnings in the console
    fullscreen: true,
    symbol: "BTCUSDT",
    interval: "1D",
    container: "tv_chart_container",
    datafeed: new Datafeeds.UDFCompatibleDatafeed(
      "https://demo-feed-data.tradingview.com"
    ),
    locale: "en",
    disabled_features: [],
    enabled_features: [],
    custom_indicators_getter: function (PineJS) {
      return Promise.resolve([
        {
          name: "Order Block Detector",
          metainfo: {
            _metainfoVersion: 52,
            id: "OrderBlockDetector@tv-basicstudies-1",
            description: "Order Block Detector [LuxAlgo]",
            shortDescription: "OB Detector",
            format: { type: "price", precision: 2 },
            linkedToSeries: true,
            is_price_study: true,

            // Define the plots for bullish and bearish order blocks
            plots: [
              { id: "bullish_ob_top", type: "line" },
              { id: "bullish_ob_bottom", type: "line" },
              { id: "bullish_ob_avg", type: "line" },
              { id: "bearish_ob_top", type: "line" },
              { id: "bearish_ob_bottom", type: "line" },
              { id: "bearish_ob_avg", type: "line" },
            ],

            // Default styles for each plot
            defaults: {
              styles: {
                bullish_ob_top: {
                  linestyle: 0,
                  linewidth: 3,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 20,
                  visible: true,
                  color: "#169400",
                },
                bullish_ob_bottom: {
                  linestyle: 0,
                  linewidth: 3,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 20,
                  visible: true,
                  color: "#169400",
                },
                bullish_ob_avg: {
                  linestyle: 2, // Dashed
                  linewidth: 2,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 50,
                  visible: true,
                  color: "#9598a1",
                },
                bearish_ob_top: {
                  linestyle: 0,
                  linewidth: 3,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 20,
                  visible: true,
                  color: "#ff1100",
                },
                bearish_ob_bottom: {
                  linestyle: 0,
                  linewidth: 3,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 20,
                  visible: true,
                  color: "#ff1100",
                },
                bearish_ob_avg: {
                  linestyle: 2, // Dashed
                  linewidth: 2,
                  plottype: 0,
                  trackPrice: false,
                  transparency: 50,
                  visible: true,
                  color: "#9598a1",
                },
              },
              inputs: {
                volumePivotLength: 5,
                bullishOBCount: 3,
                bearishOBCount: 3,
                mitigationMethod: 0, // 0 = Wick, 1 = Close
              },
            },

            // Style configuration
            styles: {
              bullish_ob_top: {
                title: "Bullish OB Top",
                histogramBase: 0,
                joinPoints: true,
              },
              bullish_ob_bottom: {
                title: "Bullish OB Bottom",
                histogramBase: 0,
                joinPoints: true,
              },
              bullish_ob_avg: {
                title: "Bullish OB Average",
                histogramBase: 0,
                joinPoints: true,
              },
              bearish_ob_top: {
                title: "Bearish OB Top",
                histogramBase: 0,
                joinPoints: true,
              },
              bearish_ob_bottom: {
                title: "Bearish OB Bottom",
                histogramBase: 0,
                joinPoints: true,
              },
              bearish_ob_avg: {
                title: "Bearish OB Average",
                histogramBase: 0,
                joinPoints: true,
              },
            },

            // Input parameters
            inputs: [
              {
                id: "volumePivotLength",
                name: "Volume Pivot Length",
                defval: 5,
                type: "integer",
                min: 1,
                max: 20,
              },
              {
                id: "bullishOBCount",
                name: "Bullish Order Block Count",
                defval: 3,
                type: "integer",
                min: 1,
                max: 10,
              },
              {
                id: "bearishOBCount",
                name: "Bearish Order Block Count",
                defval: 3,
                type: "integer",
                min: 1,
                max: 10,
              },
              {
                id: "mitigationMethod",
                name: "Mitigation Method",
                defval: 0,
                type: "integer",
                options: ["Wick", "Close"],
              },
            ],
          },

          constructor: function () {
            this.init = function (context, inputCallback) {
              this._context = context;
              this._input = inputCallback;

              // Initialize arrays to store order blocks
              this._bull_top = [];
              this._bull_btm = [];
              this._bull_avg = [];
              this._bull_left = [];

              this._bear_top = [];
              this._bear_btm = [];
              this._bear_avg = [];
              this._bear_left = [];

              // Market structure oscillator
              this._os = 0; // 0 = bearish, 1 = bullish
            };

            this.main = function (ctx, inputCallback) {
              this._context = ctx;
              this._input = inputCallback;

              // Get input parameters
              var length = this._input(0); // volumePivotLength
              var bullishOBCount = this._input(1);
              var bearishOBCount = this._input(2);
              var mitigationMethod = this._input(3); // 0 = Wick, 1 = Close

              // Set minimum additional depth for historical data
              this._context.setMinimumAdditionalDepth(length * 3);

              // Get price data
              var high = PineJS.Std.high(this._context);
              var low = PineJS.Std.low(this._context);
              var close = PineJS.Std.close(this._context);
              var volume = PineJS.Std.volume(this._context);

              // Calculate hl2 (average of high and low)
              var hl2 = (high + low) / 2;

              // Create series for calculations
              var high_series = this._context.new_var(high);
              var low_series = this._context.new_var(low);
              var volume_series = this._context.new_var(volume);

              // Calculate highest high and lowest low over length period
              var upper = PineJS.Std.highest(high_series, length, this._context);
              var lower = PineJS.Std.lowest(low_series, length, this._context);

              // Market structure oscillator logic
              // Get price at [length] bars ago
              var high_at_length = this._context.new_var(high);
              var low_at_length = this._context.new_var(low);

              var past_high = high_at_length.get(length);
              var past_low = low_at_length.get(length);

              // Update market structure:
              // os = 0 (bearish) if high[length] > upper
              // os = 1 (bullish) if low[length] < lower
              // else keep previous value
              if (past_high > upper) {
                this._os = 0; // Bearish
              } else if (past_low < lower) {
                this._os = 1; // Bullish
              }
              // else this._os stays the same

              // Check for volume pivot high
              // A volume pivot high occurs when volume is higher than
              // the volume of 'length' bars on both sides
              var is_pivot = true;

              // Check left side
              for (var i = 1; i <= length; i++) {
                if (volume <= volume_series.get(i)) {
                  is_pivot = false;
                  break;
                }
              }

              // Check right side (we need to look ahead, which isn't available in real-time)
              // In Pine Script, this is handled with a delay
              // For now, we'll detect pivots with a delay
              if (is_pivot && volume > 0) {
                // Order block is at [length] bars ago from pivot
                var ob_high = high_series.get(length);
                var ob_low = low_series.get(length);
                var ob_hl2 = (ob_high + ob_low) / 2;

                // Bullish order block: formed when os == 1 at pivot
                if (this._os === 1) {
                  var top = ob_hl2;
                  var btm = ob_low;
                  var avg = (top + btm) / 2;

                  // Add to beginning of arrays
                  this._bull_top.unshift(top);
                  this._bull_btm.unshift(btm);
                  this._bull_avg.unshift(avg);
                  this._bull_left.unshift(this._context.symbol.time);

                  // Keep only the most recent blocks
                  if (this._bull_top.length > bullishOBCount) {
                    this._bull_top.pop();
                    this._bull_btm.pop();
                    this._bull_avg.pop();
                    this._bull_left.pop();
                  }
                }

                // Bearish order block: formed when os == 0 at pivot
                if (this._os === 0) {
                  var top = ob_high;
                  var btm = ob_hl2;
                  var avg = (top + btm) / 2;

                  // Add to beginning of arrays
                  this._bear_top.unshift(top);
                  this._bear_btm.unshift(btm);
                  this._bear_avg.unshift(avg);
                  this._bear_left.unshift(this._context.symbol.time);

                  // Keep only the most recent blocks
                  if (this._bear_top.length > bearishOBCount) {
                    this._bear_top.pop();
                    this._bear_btm.pop();
                    this._bear_avg.pop();
                    this._bear_left.pop();
                  }
                }
              }

              // Check for mitigation
              // Bullish blocks are mitigated when price goes below bottom
              // Bearish blocks are mitigated when price goes above top
              var target = mitigationMethod === 1 ? close : (this._os === 1 ? low : high);

              // Remove mitigated bullish blocks
              for (var i = this._bull_btm.length - 1; i >= 0; i--) {
                if (target < this._bull_btm[i]) {
                  this._bull_top.splice(i, 1);
                  this._bull_btm.splice(i, 1);
                  this._bull_avg.splice(i, 1);
                  this._bull_left.splice(i, 1);
                }
              }

              // Remove mitigated bearish blocks
              for (var i = this._bear_top.length - 1; i >= 0; i--) {
                if (target > this._bear_top[i]) {
                  this._bear_top.splice(i, 1);
                  this._bear_btm.splice(i, 1);
                  this._bear_avg.splice(i, 1);
                  this._bear_left.splice(i, 1);
                }
              }

              // Return the most recent block values (or null if no blocks)
              var bull_top_val = this._bull_top.length > 0 ? this._bull_top[0] : null;
              var bull_btm_val = this._bull_btm.length > 0 ? this._bull_btm[0] : null;
              var bull_avg_val = this._bull_avg.length > 0 ? this._bull_avg[0] : null;

              var bear_top_val = this._bear_top.length > 0 ? this._bear_top[0] : null;
              var bear_btm_val = this._bear_btm.length > 0 ? this._bear_btm[0] : null;
              var bear_avg_val = this._bear_avg.length > 0 ? this._bear_avg[0] : null;

              // Return array of values for each plot
              return [
                bull_top_val,
                bull_btm_val,
                bull_avg_val,
                bear_top_val,
                bear_btm_val,
                bear_avg_val,
              ];
            };
          },
        },
      ]);
    },
  }));

  // When chart is ready, create the Order Block Detector study
  widget.onChartReady(() => {
    widget
      .chart()
      .createStudy("Order Block Detector", false, false, undefined, {});
  });
}

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", initOnReady, false);
