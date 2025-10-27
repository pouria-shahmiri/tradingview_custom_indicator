import { useState, useMemo } from 'react'
import './App.css'
import TradingViewChart from './components/TradingViewChart'
import { generateSampleData } from './utils/generateSampleData'
import { simpleMovingAverage, exponentialMovingAverage, relativeStrengthIndex } from './indicators/simpleMovingAverage'

function App() {
  // Generate sample candlestick data
  const chartData = useMemo(() => generateSampleData(200, 100), []);

  // State to track which indicator to display
  const [indicatorType, setIndicatorType] = useState<'sma' | 'ema' | 'rsi'>('sma');
  const [period, setPeriod] = useState<number>(20);

  // Calculate the selected indicator
  const customIndicator = useMemo(() => {
    return (data: typeof chartData) => {
      switch (indicatorType) {
        case 'sma':
          return simpleMovingAverage(data, period);
        case 'ema':
          return exponentialMovingAverage(data, period);
        case 'rsi':
          return relativeStrengthIndex(data, period);
        default:
          return simpleMovingAverage(data, period);
      }
    };
  }, [indicatorType, period]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
        TradingView Chart with Custom Indicators
      </h1>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ marginRight: '10px' }}>Indicator:</label>
          <select
            value={indicatorType}
            onChange={(e) => setIndicatorType(e.target.value as 'sma' | 'ema' | 'rsi')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="sma">Simple Moving Average (SMA)</option>
            <option value="ema">Exponential Moving Average (EMA)</option>
            <option value="rsi">Relative Strength Index (RSI)</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>Period:</label>
          <input
            type="number"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            min="2"
            max="100"
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '80px'
            }}
          />
        </div>
      </div>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <TradingViewChart
          data={chartData}
          customIndicator={customIndicator}
        />
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: '0' }}>About the Indicators:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Simple Moving Average (SMA):</strong> Calculates the average of closing prices over the specified period. Useful for identifying trends.</li>
          <li><strong>Exponential Moving Average (EMA):</strong> Similar to SMA but gives more weight to recent prices. More responsive to price changes.</li>
          <li><strong>Relative Strength Index (RSI):</strong> Momentum oscillator that measures the speed and magnitude of price changes. Values range from 0-100.</li>
        </ul>
      </div>
    </div>
  )
}

export default App
