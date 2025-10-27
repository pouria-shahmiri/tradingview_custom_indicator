import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time } from 'lightweight-charts';

interface TradingViewChartProps {
  data: CandlestickData<Time>[];
  customIndicator?: (data: CandlestickData<Time>[]) => { time: Time; value: number }[];
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, customIndicator }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1e1e1e' },
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

    // Add custom indicator if provided
    if (customIndicator) {
      const indicatorData = customIndicator(data);
      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      lineSeries.setData(indicatorData);
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
  }, [data, customIndicator]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '500px',
        position: 'relative',
      }}
    />
  );
};

export default TradingViewChart;
