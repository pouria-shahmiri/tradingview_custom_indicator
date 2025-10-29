'use client'

import { useEffect, useRef, useState } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { calculateOrderBlocks, type OrderBlockConfig } from '../utils/orderBlockCalculator';

interface TradingViewChartProps {
  symbol: string;
  orderBlockConfig: OrderBlockConfig;
  showOrderBlocks: boolean;
}

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  orderBlockConfig,
  showOrderBlocks,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const orderBlockOverlayRef = useRef<HTMLDivElement>(null);
  const orderBlockCleanupRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#1e1e1e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2b2b43' },
        horzLines: { color: '#2b2b43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Fetch and update data
  useEffect(() => {
    const fetchData = async () => {
      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch data from Binance
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=500`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          throw new Error('No data available for this symbol');
        }

        // Convert to chart format
        const candlestickData: CandlestickData[] = data.map((item: any) => ({
          time: (item[0] / 1000) as Time,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));

        const volumeData = data.map((item: any) => {
          const close = parseFloat(item[4]);
          const open = parseFloat(item[1]);
          return {
            time: (item[0] / 1000) as Time,
            value: parseFloat(item[5]),
            color: close >= open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
          };
        });

        candlestickSeriesRef.current.setData(candlestickData);
        volumeSeriesRef.current.setData(volumeData);

        // Calculate and draw order blocks if enabled
        if (showOrderBlocks) {
          const bars: Bar[] = data.map((item: any) => ({
            time: item[0],
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
          }));

          // Clean up previous subscription if exists
          if (orderBlockCleanupRef.current) {
            orderBlockCleanupRef.current();
          }

          // Draw order blocks and store cleanup function
          orderBlockCleanupRef.current = drawOrderBlocks(bars);
        } else {
          // Clear order blocks if disabled
          if (orderBlockOverlayRef.current) {
            orderBlockOverlayRef.current.innerHTML = '';
          }
          if (orderBlockCleanupRef.current) {
            orderBlockCleanupRef.current();
            orderBlockCleanupRef.current = null;
          }
        }

        chartRef.current?.timeScale().fitContent();
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, showOrderBlocks, orderBlockConfig]);

  const drawOrderBlocks = (bars: Bar[]): (() => void) => {
    if (!chartRef.current || !candlestickSeriesRef.current || !orderBlockOverlayRef.current) {
      return () => {}; // Return empty cleanup function if refs are not ready
    }

    const { bullishBlocks, bearishBlocks } = calculateOrderBlocks(bars, orderBlockConfig);

    console.log(`Detected ${bullishBlocks.length} bullish and ${bearishBlocks.length} bearish order blocks`);

    // Clear existing order block overlays
    orderBlockOverlayRef.current.innerHTML = '';

    const chart = chartRef.current;
    const timeScale = chart.timeScale();
    const candlestickSeries = candlestickSeriesRef.current;

    const updateBoxes = () => {
      if (!orderBlockOverlayRef.current || !candlestickSeries) return;
      orderBlockOverlayRef.current.innerHTML = '';

      // Draw bullish order blocks (green lines)
      bullishBlocks.forEach((block) => {
        const startX = timeScale.timeToCoordinate(block.startTime as Time);
        const endX = timeScale.timeToCoordinate(block.endTime as Time);
        const topY = candlestickSeries.priceToCoordinate(block.top);
        const bottomY = candlestickSeries.priceToCoordinate(block.bottom);
        const avgY = candlestickSeries.priceToCoordinate(block.average);

        if (startX === null || endX === null || topY === null || bottomY === null || avgY === null) return;

        // Create top line
        const topLine = document.createElement('div');
        topLine.style.position = 'absolute';
        topLine.style.left = `${startX}px`;
        topLine.style.top = `${topY}px`;
        topLine.style.width = `${endX - startX}px`;
        topLine.style.height = '2px';
        topLine.style.backgroundColor = 'rgba(22, 148, 0, 0.8)';
        topLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(topLine);

        // Create bottom line
        const bottomLine = document.createElement('div');
        bottomLine.style.position = 'absolute';
        bottomLine.style.left = `${startX}px`;
        bottomLine.style.top = `${bottomY}px`;
        bottomLine.style.width = `${endX - startX}px`;
        bottomLine.style.height = '2px';
        bottomLine.style.backgroundColor = 'rgba(22, 148, 0, 0.8)';
        bottomLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(bottomLine);

        // Create average line (dashed)
        const avgLine = document.createElement('div');
        avgLine.style.position = 'absolute';
        avgLine.style.left = `${startX}px`;
        avgLine.style.top = `${avgY}px`;
        avgLine.style.width = `${endX - startX}px`;
        avgLine.style.height = '1px';
        avgLine.style.borderTop = '1px dashed rgba(149, 152, 161, 0.5)';
        avgLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(avgLine);
      });

      // Draw bearish order blocks (red lines)
      bearishBlocks.forEach((block) => {
        const startX = timeScale.timeToCoordinate(block.startTime as Time);
        const endX = timeScale.timeToCoordinate(block.endTime as Time);
        const topY = candlestickSeries.priceToCoordinate(block.top);
        const bottomY = candlestickSeries.priceToCoordinate(block.bottom);
        const avgY = candlestickSeries.priceToCoordinate(block.average);

        if (startX === null || endX === null || topY === null || bottomY === null || avgY === null) return;

        // Create top line
        const topLine = document.createElement('div');
        topLine.style.position = 'absolute';
        topLine.style.left = `${startX}px`;
        topLine.style.top = `${topY}px`;
        topLine.style.width = `${endX - startX}px`;
        topLine.style.height = '2px';
        topLine.style.backgroundColor = 'rgba(255, 17, 0, 0.8)';
        topLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(topLine);

        // Create bottom line
        const bottomLine = document.createElement('div');
        bottomLine.style.position = 'absolute';
        bottomLine.style.left = `${startX}px`;
        bottomLine.style.top = `${bottomY}px`;
        bottomLine.style.width = `${endX - startX}px`;
        bottomLine.style.height = '2px';
        bottomLine.style.backgroundColor = 'rgba(255, 17, 0, 0.8)';
        bottomLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(bottomLine);

        // Create average line (dashed)
        const avgLine = document.createElement('div');
        avgLine.style.position = 'absolute';
        avgLine.style.left = `${startX}px`;
        avgLine.style.top = `${avgY}px`;
        avgLine.style.width = `${endX - startX}px`;
        avgLine.style.height = '1px';
        avgLine.style.borderTop = '1px dashed rgba(149, 152, 161, 0.5)';
        avgLine.style.pointerEvents = 'none';
        orderBlockOverlayRef.current?.appendChild(avgLine);
      });
    };

    // Initial draw
    updateBoxes();

    // Update boxes when chart is scrolled or zoomed
    const handleVisibleRangeChange = () => {
      updateBoxes();
    };

    timeScale.subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    // Clean up subscription when component unmounts or symbol changes
    return () => {
      timeScale.unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);
    };
  };

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#d1d4dc',
            fontSize: '18px',
            zIndex: 10,
          }}
        >
          Loading chart data...
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ef5350',
            fontSize: '16px',
            zIndex: 10,
            textAlign: 'center',
            padding: '20px',
          }}
        >
          Error: {error}
          <br />
          <span style={{ fontSize: '14px', color: '#d1d4dc' }}>
            Make sure the symbol is valid (e.g., BTCUSDT, ETHUSDT)
          </span>
        </div>
      )}
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      >
        <div
          ref={orderBlockOverlayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
