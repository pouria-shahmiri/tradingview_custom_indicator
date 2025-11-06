'use client'

import { useEffect, useRef } from 'react';
import BinanceDatafeed from '@/datafeed/binanceDatafeed';
import createOrderBlockDetectorStudy from '@/studies/OrderBlockDetectorStudy';

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
  theme = 'dark',
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

      // Load local charting library
      const chartingLibScript = document.createElement('script');
      chartingLibScript.src = '/charting_library/charting_library.standalone.js';
      chartingLibScript.async = false;

      // Add scripts to document
      document.head.appendChild(chartingLibScript);

      // Wait for script to load
      await new Promise((resolve, reject) => {
        chartingLibScript.onload = resolve;
        chartingLibScript.onerror = reject;
      });

      initWidget();
    };

    const initWidget = () => {
      if (!containerRef.current || !window.TradingView) return;

      // Create widget with professional charting library
      const widget = new window.TradingView.widget({
        library_path: '/charting_library/',
        fullscreen: false,
        autosize: true,
        symbol: symbol,
        interval: interval,
        container: containerRef.current,
        datafeed: new BinanceDatafeed(),
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

        // Custom indicators
        custom_indicators_getter: function (PineJS: any) {
          return Promise.resolve([
            createOrderBlockDetectorStudy(PineJS),
          ]);
        },
      });

      widgetRef.current = widget;
      window.tvWidget = widget;

      // Initialize Order Block Detector
      widget.onChartReady(() => {
        console.log('Chart is ready!');
        console.log('');
        console.log('✓ Order Block Detector is now available!');
        console.log('');
        console.log('To add it to your chart:');
        console.log('1. Click the "Indicators" button (📊 icon) in the toolbar');
        console.log('2. Search for "Order Block Detector" or "OB Detector"');
        console.log('3. Click on it to add to your chart');
        console.log('');
        console.log('The indicator will show:');
        console.log('- Green filled zones for Bullish Order Blocks');
        console.log('- Red filled zones for Bearish Order Blocks');
        console.log('');
        console.log('You can customize settings after adding it!');
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
