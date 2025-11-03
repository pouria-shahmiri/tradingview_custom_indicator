'use client'

import { useEffect, useRef } from 'react';

// Declare TradingView types
declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
  }
}

interface TradingViewAdvancedChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

const TradingViewAdvancedChart: React.FC<TradingViewAdvancedChartProps> = ({
  symbol = 'BTCUSDT',
  interval = '1D',
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load TradingView library scripts
    const loadScripts = async () => {
      // Check if scripts are already loaded
      if (window.TradingView) {
        initWidget();
        return;
      }

      // Load charting library
      const chartingLibScript = document.createElement('script');
      chartingLibScript.src = 'https://charting-library.tradingview-widget.com/charting_library/charting_library.standalone.js';
      chartingLibScript.async = true;

      // Load UDF datafeed
      const datafeedScript = document.createElement('script');
      datafeedScript.src = 'https://charting-library.tradingview-widget.com/datafeeds/udf/dist/bundle.js';
      datafeedScript.async = true;

      // Add scripts to document
      document.head.appendChild(chartingLibScript);
      document.head.appendChild(datafeedScript);

      // Wait for both scripts to load
      await Promise.all([
        new Promise((resolve) => {
          chartingLibScript.onload = resolve;
        }),
        new Promise((resolve) => {
          datafeedScript.onload = resolve;
        }),
      ]);

      initWidget();
    };

    const initWidget = () => {
      if (!containerRef.current || !window.TradingView) return;

      // Create widget
      const widget = new window.TradingView.widget({
        library_path: 'https://charting-library.tradingview-widget.com/charting_library/',
        fullscreen: false,
        autosize: true,
        symbol: symbol,
        interval: interval,
        container: containerRef.current,
        datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
          'https://demo-feed-data.tradingview.com'
        ),
        locale: 'en',
        theme: theme,

        // Advanced features enabled
        enabled_features: [
          'study_templates',
          'side_toolbar_in_fullscreen_mode',
          'header_in_fullscreen_mode',
          'move_logo_to_main_pane',
          'create_volume_indicator_by_default',
          'property_pages',
          'show_chart_property_page',
          'chart_property_page_scales',
          'chart_property_page_trading',
          'show_interval_dialog_on_key_press',
          'countdown',
          'display_market_status',
          'high_density_bars',
          'use_localstorage_for_settings',
          'save_chart_properties_to_local_storage',
          'show_zoom_and_move_buttons_on_touch',
          'chart_crosshair_menu',
          'same_data_requery',
          'control_bar',
          'timeframes_toolbar',
          'edit_buttons_in_legend',
          'context_menus',
          'pricescale_currency',
          'scales_date_format',
          'main_series_scale_menu',
          'show_object_tree',
          'chart_style_hilo',
          'items_favoriting',
          'save_shortcut',
          'study_market_minimized',
        ],

        disabled_features: [
          'header_saveload',
          'go_to_date',
        ],

        // Chart settings
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user_id',

        // UI customization
        loading_screen: { backgroundColor: theme === 'dark' ? '#131722' : '#ffffff' },

        // Overrides
        overrides: {
          'mainSeriesProperties.style': 1,
          'mainSeriesProperties.showCountdown': true,
          'paneProperties.background': theme === 'dark' ? '#131722' : '#ffffff',
          'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2e39' : '#e1e3e6',
          'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2e39' : '#e1e3e6',
          'symbolWatermarkProperties.transparency': 90,
          'scalesProperties.textColor': theme === 'dark' ? '#787b86' : '#787b86',
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
          'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
        },

        studies_overrides: {
          'volume.volume.color.0': '#ef5350',
          'volume.volume.color.1': '#26a69a',
          'volume.volume.transparency': 65,
        },

        // Custom indicator
        custom_indicators_getter: function (PineJS: any) {
          return Promise.resolve([
            {
              name: 'Order Block Detector',
              metainfo: {
                _metainfoVersion: 52,
                id: 'OrderBlockDetector@tv-basicstudies-1',
                description: 'Order Block Detector [LuxAlgo]',
                shortDescription: 'OB Detector',
                format: { type: 'price', precision: 2 },
                linkedToSeries: true,
                is_price_study: true,

                plots: [
                  { id: 'bullish_ob_top', type: 'line' },
                  { id: 'bullish_ob_bottom', type: 'line' },
                  { id: 'bullish_ob_avg', type: 'line' },
                  { id: 'bearish_ob_top', type: 'line' },
                  { id: 'bearish_ob_bottom', type: 'line' },
                  { id: 'bearish_ob_avg', type: 'line' },
                ],

                defaults: {
                  styles: {
                    bullish_ob_top: {
                      linestyle: 0,
                      linewidth: 3,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 20,
                      visible: true,
                      color: '#169400',
                    },
                    bullish_ob_bottom: {
                      linestyle: 0,
                      linewidth: 3,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 20,
                      visible: true,
                      color: '#169400',
                    },
                    bullish_ob_avg: {
                      linestyle: 2,
                      linewidth: 2,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 50,
                      visible: true,
                      color: '#9598a1',
                    },
                    bearish_ob_top: {
                      linestyle: 0,
                      linewidth: 3,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 20,
                      visible: true,
                      color: '#ff1100',
                    },
                    bearish_ob_bottom: {
                      linestyle: 0,
                      linewidth: 3,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 20,
                      visible: true,
                      color: '#ff1100',
                    },
                    bearish_ob_avg: {
                      linestyle: 2,
                      linewidth: 2,
                      plottype: 0,
                      trackPrice: false,
                      transparency: 50,
                      visible: true,
                      color: '#9598a1',
                    },
                  },
                  inputs: {
                    volumePivotLength: 5,
                    bullishOBCount: 3,
                    bearishOBCount: 3,
                    mitigationMethod: 0,
                  },
                },

                styles: {
                  bullish_ob_top: { title: 'Bullish OB Top', histogramBase: 0, joinPoints: true },
                  bullish_ob_bottom: { title: 'Bullish OB Bottom', histogramBase: 0, joinPoints: true },
                  bullish_ob_avg: { title: 'Bullish OB Average', histogramBase: 0, joinPoints: true },
                  bearish_ob_top: { title: 'Bearish OB Top', histogramBase: 0, joinPoints: true },
                  bearish_ob_bottom: { title: 'Bearish OB Bottom', histogramBase: 0, joinPoints: true },
                  bearish_ob_avg: { title: 'Bearish OB Average', histogramBase: 0, joinPoints: true },
                },

                inputs: [
                  {
                    id: 'volumePivotLength',
                    name: 'Volume Pivot Length',
                    defval: 5,
                    type: 'integer',
                    min: 1,
                    max: 20,
                  },
                  {
                    id: 'bullishOBCount',
                    name: 'Bullish Order Block Count',
                    defval: 3,
                    type: 'integer',
                    min: 1,
                    max: 10,
                  },
                  {
                    id: 'bearishOBCount',
                    name: 'Bearish Order Block Count',
                    defval: 3,
                    type: 'integer',
                    min: 1,
                    max: 10,
                  },
                  {
                    id: 'mitigationMethod',
                    name: 'Mitigation Method',
                    defval: 0,
                    type: 'integer',
                    options: ['Wick', 'Close'],
                  },
                ],
              },

              constructor: function (this: any) {
                this.init = function (context: any, inputCallback: any) {
                  this._context = context;
                  this._input = inputCallback;

                  this._bull_top = [];
                  this._bull_btm = [];
                  this._bull_avg = [];
                  this._bull_left = [];

                  this._bear_top = [];
                  this._bear_btm = [];
                  this._bear_avg = [];
                  this._bear_left = [];

                  this._os = 0;
                };

                this.main = function (ctx: any, inputCallback: any) {
                  this._context = ctx;
                  this._input = inputCallback;

                  const length = this._input(0);
                  const bullishOBCount = this._input(1);
                  const bearishOBCount = this._input(2);
                  const mitigationMethod = this._input(3);

                  this._context.setMinimumAdditionalDepth(length * 3);

                  const high = PineJS.Std.high(this._context);
                  const low = PineJS.Std.low(this._context);
                  const close = PineJS.Std.close(this._context);
                  const volume = PineJS.Std.volume(this._context);

                  const high_series = this._context.new_var(high);
                  const low_series = this._context.new_var(low);
                  const volume_series = this._context.new_var(volume);

                  const upper = PineJS.Std.highest(high_series, length, this._context);
                  const lower = PineJS.Std.lowest(low_series, length, this._context);

                  const past_high = high_series.get(length);
                  const past_low = low_series.get(length);

                  if (past_high > upper) {
                    this._os = 0;
                  } else if (past_low < lower) {
                    this._os = 1;
                  }

                  let is_pivot = true;
                  for (let i = 1; i <= length; i++) {
                    if (volume <= volume_series.get(i)) {
                      is_pivot = false;
                      break;
                    }
                  }

                  if (is_pivot && volume > 0) {
                    const ob_high = high_series.get(length);
                    const ob_low = low_series.get(length);
                    const ob_hl2 = (ob_high + ob_low) / 2;

                    if (this._os === 1) {
                      const top = ob_hl2;
                      const btm = ob_low;
                      const avg = (top + btm) / 2;

                      this._bull_top.unshift(top);
                      this._bull_btm.unshift(btm);
                      this._bull_avg.unshift(avg);
                      this._bull_left.unshift(this._context.symbol.time);

                      if (this._bull_top.length > bullishOBCount) {
                        this._bull_top.pop();
                        this._bull_btm.pop();
                        this._bull_avg.pop();
                        this._bull_left.pop();
                      }
                    }

                    if (this._os === 0) {
                      const top = ob_high;
                      const btm = ob_hl2;
                      const avg = (top + btm) / 2;

                      this._bear_top.unshift(top);
                      this._bear_btm.unshift(btm);
                      this._bear_avg.unshift(avg);
                      this._bear_left.unshift(this._context.symbol.time);

                      if (this._bear_top.length > bearishOBCount) {
                        this._bear_top.pop();
                        this._bear_btm.pop();
                        this._bear_avg.pop();
                        this._bear_left.pop();
                      }
                    }
                  }

                  const target = mitigationMethod === 1 ? close : (this._os === 1 ? low : high);

                  for (let i = this._bull_btm.length - 1; i >= 0; i--) {
                    if (target < this._bull_btm[i]) {
                      this._bull_top.splice(i, 1);
                      this._bull_btm.splice(i, 1);
                      this._bull_avg.splice(i, 1);
                      this._bull_left.splice(i, 1);
                    }
                  }

                  for (let i = this._bear_top.length - 1; i >= 0; i--) {
                    if (target > this._bear_top[i]) {
                      this._bear_top.splice(i, 1);
                      this._bear_btm.splice(i, 1);
                      this._bear_avg.splice(i, 1);
                      this._bear_left.splice(i, 1);
                    }
                  }

                  const bull_top_val = this._bull_top.length > 0 ? this._bull_top[0] : null;
                  const bull_btm_val = this._bull_btm.length > 0 ? this._bull_btm[0] : null;
                  const bull_avg_val = this._bull_avg.length > 0 ? this._bull_avg[0] : null;

                  const bear_top_val = this._bear_top.length > 0 ? this._bear_top[0] : null;
                  const bear_btm_val = this._bear_btm.length > 0 ? this._bear_btm[0] : null;
                  const bear_avg_val = this._bear_avg.length > 0 ? this._bear_avg[0] : null;

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
      });

      widgetRef.current = widget;
      window.tvWidget = widget;

      // Initialize indicator when chart is ready
      widget.onChartReady(() => {
        console.log('Chart is ready! Initializing Order Block Detector...');

        widget
          .chart()
          .createStudy('Order Block Detector', true, false, [5, 3, 3, 0], {});

        console.log('Order Block Detector initialized successfully!');
      });
    };

    loadScripts();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TradingViewAdvancedChart;
