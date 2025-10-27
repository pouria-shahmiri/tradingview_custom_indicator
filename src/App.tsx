import { useState, useMemo } from 'react'
import './App.css'
import TradingViewChart from './components/TradingViewChart'
import { generateSampleData } from './utils/generateSampleData'
import { simpleMovingAverage, hullSuite, type HullSuiteMode } from './indicators/simpleMovingAverage'

function App() {
  // Generate sample candlestick data
  const chartData = useMemo(() => generateSampleData(200, 100), []);

  // State for indicators
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [smaPeriod, setSmaPeriod] = useState<number>(20);

  const [showHullSuite, setShowHullSuite] = useState<boolean>(true);
  const [hullMode, setHullMode] = useState<HullSuiteMode>('Hma');
  const [hullLength, setHullLength] = useState<number>(55);
  const [hullLengthMult, setHullLengthMult] = useState<number>(1.0);

  // Calculate SMA indicator
  const smaIndicator = useMemo(() => {
    if (!showSMA) return undefined;
    return (data: typeof chartData) => simpleMovingAverage(data, smaPeriod);
  }, [showSMA, smaPeriod]);

  // Calculate Hull Suite indicator
  const hullSuiteData = useMemo(() => {
    if (!showHullSuite) return undefined;
    return hullSuite(chartData, {
      mode: hullMode,
      length: hullLength,
      lengthMult: hullLengthMult,
    });
  }, [chartData, showHullSuite, hullMode, hullLength, hullLengthMult]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        TradingView Advanced Chart with Custom Indicators
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '8px',
      }}>
        {/* SMA Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showSMA}
              onChange={(e) => setShowSMA(e.target.checked)}
            />
            <strong>Simple Moving Average (SMA)</strong>
          </label>
          {showSMA && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Period:
                <input
                  type="number"
                  value={smaPeriod}
                  onChange={(e) => setSmaPeriod(Number(e.target.value))}
                  min="2"
                  max="200"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '70px',
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* Hull Suite Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showHullSuite}
              onChange={(e) => setShowHullSuite(e.target.checked)}
            />
            <strong>Hull Suite</strong>
          </label>
          {showHullSuite && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Mode:
                <select
                  value={hullMode}
                  onChange={(e) => setHullMode(e.target.value as HullSuiteMode)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="Hma">HMA</option>
                  <option value="Ehma">EHMA</option>
                  <option value="Thma">THMA</option>
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Length:
                <input
                  type="number"
                  value={hullLength}
                  onChange={(e) => setHullLength(Number(e.target.value))}
                  min="2"
                  max="200"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '70px',
                  }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Length Multiplier:
                <input
                  type="number"
                  value={hullLengthMult}
                  onChange={(e) => setHullLengthMult(Number(e.target.value))}
                  min="0.1"
                  max="5"
                  step="0.1"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '70px',
                  }}
                />
              </label>
            </>
          )}
        </div>
      </div>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <TradingViewChart
          data={chartData}
          customIndicator={smaIndicator}
          hullSuiteData={hullSuiteData}
        />
      </div>
    </div>
  )
}

export default App
