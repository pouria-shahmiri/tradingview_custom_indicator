import { useEffect, useRef, useState } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time } from 'lightweight-charts';
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
  const orderBlockSeriesRef = useRef<any[]>([]);
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

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addHistogramSeries({
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

          drawOrderBlocks(bars);
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

  const drawOrderBlocks = (bars: Bar[]) => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    // Remove existing order block series
    orderBlockSeriesRef.current.forEach((series) => {
      try {
        chartRef.current?.removeSeries(series);
      } catch (e) {
        // Ignore if series already removed
      }
    });
    orderBlockSeriesRef.current = [];

    const { bullishBlocks, bearishBlocks } = calculateOrderBlocks(bars, orderBlockConfig);

    console.log(`Detected ${bullishBlocks.length} bullish and ${bearishBlocks.length} bearish order blocks`);

    // Draw bullish order blocks (green boxes)
    bullishBlocks.forEach((block) => {
      // Top border line
      const topLine = chartRef.current!.addLineSeries({
        color: 'rgba(38, 166, 154, 0.9)',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      topLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.top },
        { time: (block.endTime / 1000) as Time, value: block.top },
      ]);
      orderBlockSeriesRef.current.push(topLine);

      // Bottom border line
      const bottomLine = chartRef.current!.addLineSeries({
        color: 'rgba(38, 166, 154, 0.9)',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      bottomLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.bottom },
        { time: (block.endTime / 1000) as Time, value: block.bottom },
      ]);
      orderBlockSeriesRef.current.push(bottomLine);

      // Fill with baseline series
      const fillSeries = chartRef.current!.addBaselineSeries({
        baseValue: { type: 'price', price: block.bottom },
        topLineColor: 'rgba(38, 166, 154, 0)',
        topFillColor1: 'rgba(38, 166, 154, 0.3)',
        topFillColor2: 'rgba(38, 166, 154, 0.1)',
        bottomLineColor: 'rgba(38, 166, 154, 0)',
        bottomFillColor1: 'rgba(38, 166, 154, 0.1)',
        bottomFillColor2: 'rgba(38, 166, 154, 0.3)',
        lastValueVisible: false,
        priceLineVisible: false,
      });
      fillSeries.setData([
        { time: (block.startTime / 1000) as Time, value: block.top },
        { time: (block.endTime / 1000) as Time, value: block.top },
      ]);
      orderBlockSeriesRef.current.push(fillSeries);

      // Average line (dashed)
      const avgLine = chartRef.current!.addLineSeries({
        color: 'rgba(149, 152, 161, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      avgLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.average },
        { time: (block.endTime / 1000) as Time, value: block.average },
      ]);
      orderBlockSeriesRef.current.push(avgLine);
    });

    // Draw bearish order blocks (red boxes)
    bearishBlocks.forEach((block) => {
      // Top border line
      const topLine = chartRef.current!.addLineSeries({
        color: 'rgba(239, 83, 80, 0.9)',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      topLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.top },
        { time: (block.endTime / 1000) as Time, value: block.top },
      ]);
      orderBlockSeriesRef.current.push(topLine);

      // Bottom border line
      const bottomLine = chartRef.current!.addLineSeries({
        color: 'rgba(239, 83, 80, 0.9)',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      bottomLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.bottom },
        { time: (block.endTime / 1000) as Time, value: block.bottom },
      ]);
      orderBlockSeriesRef.current.push(bottomLine);

      // Fill with baseline series
      const fillSeries = chartRef.current!.addBaselineSeries({
        baseValue: { type: 'price', price: block.bottom },
        topLineColor: 'rgba(239, 83, 80, 0)',
        topFillColor1: 'rgba(239, 83, 80, 0.3)',
        topFillColor2: 'rgba(239, 83, 80, 0.1)',
        bottomLineColor: 'rgba(239, 83, 80, 0)',
        bottomFillColor1: 'rgba(239, 83, 80, 0.1)',
        bottomFillColor2: 'rgba(239, 83, 80, 0.3)',
        lastValueVisible: false,
        priceLineVisible: false,
      });
      fillSeries.setData([
        { time: (block.startTime / 1000) as Time, value: block.top },
        { time: (block.endTime / 1000) as Time, value: block.top },
      ]);
      orderBlockSeriesRef.current.push(fillSeries);

      // Average line (dashed)
      const avgLine = chartRef.current!.addLineSeries({
        color: 'rgba(149, 152, 161, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      avgLine.setData([
        { time: (block.startTime / 1000) as Time, value: block.average },
        { time: (block.endTime / 1000) as Time, value: block.average },
      ]);
      orderBlockSeriesRef.current.push(avgLine);
    });
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
      />
    </div>
  );
};

export default TradingViewChart;
