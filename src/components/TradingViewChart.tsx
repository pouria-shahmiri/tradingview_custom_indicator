import { useEffect, useRef } from 'react';
import datafeed from '../datafeed/datafeed';
import { calculateOrderBlocks, type OrderBlockConfig } from '../utils/orderBlockCalculator';

interface TradingViewChartProps {
  symbol: string;
  orderBlockConfig: OrderBlockConfig;
  showOrderBlocks: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  orderBlockConfig,
  showOrderBlocks,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const orderBlockShapesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current || !window.TradingView) {
      console.error('TradingView library not loaded');
      return;
    }

    // Create the widget
    const widget = new window.TradingView.widget({
      width: chartContainerRef.current.clientWidth,
      height: 600,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#1e1e1e',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: chartContainerRef.current.id || 'tradingview_chart',
      datafeed: datafeed,
      library_path: '/charting_library/',
      disabled_features: [
        'use_localstorage_for_settings',
        'header_symbol_search',
        'symbol_search_hot_key',
      ],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
      ],
      loading_screen: { backgroundColor: '#1e1e1e' },
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#26a69a',
        'mainSeriesProperties.candleStyle.downColor': '#ef5350',
        'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
        'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
      },
      studies_overrides: {},
    });

    widgetRef.current = widget;

    // Wait for chart to be ready, then add order blocks
    widget.onChartReady(() => {
      console.log('Chart is ready');

      // Add volume indicator
      widget.activeChart().createStudy('Volume', false, false);

      // Subscribe to data changes to update order blocks
      if (showOrderBlocks) {
        updateOrderBlocks(widget);
      }
    });

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
    };
  }, [symbol]);

  // Update order blocks when config changes
  useEffect(() => {
    if (widgetRef.current && widgetRef.current.activeChart) {
      updateOrderBlocks(widgetRef.current);
    }
  }, [orderBlockConfig, showOrderBlocks]);

  const updateOrderBlocks = async (widget: any) => {
    try {
      // Remove existing order block shapes
      orderBlockShapesRef.current.forEach((shapeId) => {
        try {
          widget.activeChart().removeEntity(shapeId);
        } catch (e) {
          // Shape might already be removed
        }
      });
      orderBlockShapesRef.current = [];

      if (!showOrderBlocks) {
        return;
      }

      // Get visible bars data
      const bars = await getVisibleBars(widget);

      if (!bars || bars.length === 0) {
        console.log('No bars data available');
        return;
      }

      // Calculate order blocks
      const { bullishBlocks, bearishBlocks } = calculateOrderBlocks(bars, orderBlockConfig);

      console.log(`Detected ${bullishBlocks.length} bullish and ${bearishBlocks.length} bearish order blocks`);

      // Draw bullish order blocks (green)
      bullishBlocks.forEach((block) => {
        try {
          // Draw filled rectangle for the order block
          const shapeId = widget.activeChart().createMultipointShape(
            [
              { time: block.startTime / 1000, price: block.top },
              { time: block.endTime / 1000, price: block.bottom },
            ],
            {
              shape: 'rectangle',
              lock: true,
              disableSelection: true,
              disableSave: true,
              disableUndo: true,
              overrides: {
                backgroundColor: 'rgba(22, 148, 0, 0.1)',
                linecolor: '#169400',
                linewidth: 2,
                fillBackground: true,
                transparency: 90,
              },
            }
          );
          orderBlockShapesRef.current.push(shapeId);

          // Draw average line
          const avgLineId = widget.activeChart().createMultipointShape(
            [
              { time: block.startTime / 1000, price: block.average },
              { time: block.endTime / 1000, price: block.average },
            ],
            {
              shape: 'trend_line',
              lock: true,
              disableSelection: true,
              disableSave: true,
              disableUndo: true,
              overrides: {
                linecolor: 'rgba(149, 152, 161, 0.5)',
                linewidth: 1,
                linestyle: 2, // Dashed
              },
            }
          );
          orderBlockShapesRef.current.push(avgLineId);
        } catch (error) {
          console.error('Error drawing bullish order block:', error);
        }
      });

      // Draw bearish order blocks (red)
      bearishBlocks.forEach((block) => {
        try {
          // Draw filled rectangle for the order block
          const shapeId = widget.activeChart().createMultipointShape(
            [
              { time: block.startTime / 1000, price: block.top },
              { time: block.endTime / 1000, price: block.bottom },
            ],
            {
              shape: 'rectangle',
              lock: true,
              disableSelection: true,
              disableSave: true,
              disableUndo: true,
              overrides: {
                backgroundColor: 'rgba(255, 17, 0, 0.1)',
                linecolor: '#ff1100',
                linewidth: 2,
                fillBackground: true,
                transparency: 90,
              },
            }
          );
          orderBlockShapesRef.current.push(shapeId);

          // Draw average line
          const avgLineId = widget.activeChart().createMultipointShape(
            [
              { time: block.startTime / 1000, price: block.average },
              { time: block.endTime / 1000, price: block.average },
            ],
            {
              shape: 'trend_line',
              lock: true,
              disableSelection: true,
              disableSave: true,
              disableUndo: true,
              overrides: {
                linecolor: 'rgba(149, 152, 161, 0.5)',
                linewidth: 1,
                linestyle: 2, // Dashed
              },
            }
          );
          orderBlockShapesRef.current.push(avgLineId);
        } catch (error) {
          console.error('Error drawing bearish order block:', error);
        }
      });
    } catch (error) {
      console.error('Error updating order blocks:', error);
    }
  };

  const getVisibleBars = (widget: any): Promise<any[]> => {
    return new Promise((resolve) => {
      // Get bars from the datafeed
      const symbolInfo = widget.symbolInterval();

      widget.activeChart().exportData({
        includeTime: true,
        includeSeries: true,
        includeVolume: true,
      }, (data: any) => {
        if (data && data.data) {
          const bars = data.data.map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume || 0,
          }));
          resolve(bars);
        } else {
          resolve([]);
        }
      });
    });
  };

  return (
    <div
      ref={chartContainerRef}
      id="tradingview_chart"
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
      }}
    />
  );
};

export default TradingViewChart;
