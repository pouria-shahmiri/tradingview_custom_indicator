import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time, ColorType, LineStyle } from 'lightweight-charts';
import type { OrderBlockDetectorResult } from '../indicators/orderBlockDetector';

interface TradingViewChartProps {
  data: CandlestickData<Time>[];
  orderBlockData?: OrderBlockDetectorResult;
  symbol?: string;
  useTradingViewWidget?: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  orderBlockData,
  symbol = 'BTCUSD',
  useTradingViewWidget = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Use TradingView Advanced Chart Widget
    if (useTradingViewWidget && window.TradingView) {
      const widget = new window.TradingView.widget({
        width: chartContainerRef.current.clientWidth,
        height: 600,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: chartContainerRef.current.id || 'tradingview_widget',
        studies: [
          'Volume@tv-basicstudies',
        ],
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['study_templates'],
        loading_screen: { backgroundColor: '#1e1e1e' },
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
          'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
          'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
        },
      });

      widgetRef.current = widget;

      return () => {
        if (widgetRef.current) {
          widgetRef.current.remove();
        }
      };
    }

    // Use lightweight-charts for custom data and indicators
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { type: ColorType.Solid, color: '#1e1e1e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(data);

    // Add Order Block Detector visualization
    if (orderBlockData) {
      // Draw bullish order blocks (green boxes)
      orderBlockData.bullishBlocks.forEach((block) => {
        // Draw top line of the box
        const topLine = chart.addLineSeries({
          color: '#169400',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });

        // Draw bottom line of the box
        const bottomLine = chart.addLineSeries({
          color: '#169400',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });

        // Draw average line
        const avgLine = chart.addLineSeries({
          color: 'rgba(149, 152, 161, 0.37)',
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
        });

        // Find the end time (extend to the right)
        const endTime = data[data.length - 1].time;

        topLine.setData([
          { time: block.leftTime, value: block.top },
          { time: endTime, value: block.top },
        ]);

        bottomLine.setData([
          { time: block.leftTime, value: block.bottom },
          { time: endTime, value: block.bottom },
        ]);

        avgLine.setData([
          { time: block.leftTime, value: block.average },
          { time: endTime, value: block.average },
        ]);
      });

      // Draw bearish order blocks (red boxes)
      orderBlockData.bearishBlocks.forEach((block) => {
        // Draw top line of the box
        const topLine = chart.addLineSeries({
          color: '#ff1100',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });

        // Draw bottom line of the box
        const bottomLine = chart.addLineSeries({
          color: '#ff1100',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });

        // Draw average line
        const avgLine = chart.addLineSeries({
          color: 'rgba(149, 152, 161, 0.37)',
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
        });

        // Find the end time (extend to the right)
        const endTime = data[data.length - 1].time;

        topLine.setData([
          { time: block.leftTime, value: block.top },
          { time: endTime, value: block.top },
        ]);

        bottomLine.setData([
          { time: block.leftTime, value: block.bottom },
          { time: endTime, value: block.bottom },
        ]);

        avgLine.setData([
          { time: block.leftTime, value: block.average },
          { time: endTime, value: block.average },
        ]);
      });

      // Draw detection points
      if (orderBlockData.bullishOBPoints.length > 0) {
        const bullishMarkerSeries = chart.addLineSeries({
          color: '#169400',
          lineWidth: 2,
        });
        bullishMarkerSeries.setData(orderBlockData.bullishOBPoints);
      }

      if (orderBlockData.bearishOBPoints.length > 0) {
        const bearishMarkerSeries = chart.addLineSeries({
          color: '#ff1100',
          lineWidth: 2,
        });
        bearishMarkerSeries.setData(orderBlockData.bearishOBPoints);
      }
    }


    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, orderBlockData, symbol, useTradingViewWidget]);

  return (
    <div
      ref={chartContainerRef}
      id="tradingview_widget"
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
      }}
    />
  );
};

export default TradingViewChart;
