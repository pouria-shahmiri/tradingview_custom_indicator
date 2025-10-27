import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time, ColorType } from 'lightweight-charts';
import type { HullSuiteResult } from '../indicators/simpleMovingAverage';

interface TradingViewChartProps {
  data: CandlestickData<Time>[];
  customIndicator?: (data: CandlestickData<Time>[]) => { time: Time; value: number }[];
  hullSuiteData?: HullSuiteResult;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, customIndicator, hullSuiteData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with advanced features
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

    // Add Hull Suite indicator if provided
    if (hullSuiteData) {
      // Main hull line
      const mainLineSeries = chart.addLineSeries({
        color: '#00ff00',
        lineWidth: 2,
        title: 'Hull Main',
      });
      mainLineSeries.setData(hullSuiteData.main);

      // Shifted hull line
      const shiftedLineSeries = chart.addLineSeries({
        color: '#ff0000',
        lineWidth: 2,
        title: 'Hull Shifted',
      });
      shiftedLineSeries.setData(hullSuiteData.shifted);

      // Add area between lines for band visualization
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(0, 255, 0, 0.3)',
        bottomColor: 'rgba(255, 0, 0, 0.3)',
        lineColor: 'transparent',
        lineWidth: 1,
      });

      // Create area data from the overlapping region
      const areaData = hullSuiteData.shifted.map((point, idx) => ({
        time: point.time,
        value: hullSuiteData.main[idx + 2]?.value || point.value,
      }));
      areaSeries.setData(areaData);
    }

    // Add custom indicator if provided (e.g., SMA)
    if (customIndicator) {
      const indicatorData = customIndicator(data);
      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'SMA',
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
  }, [data, customIndicator, hullSuiteData]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
      }}
    />
  );
};

export default TradingViewChart;
