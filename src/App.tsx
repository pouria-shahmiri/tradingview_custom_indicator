import { useState, useMemo } from 'react'
import './App.css'
import TradingViewChart from './components/TradingViewChart'
import { generateSampleData } from './utils/generateSampleData'
import { orderBlockDetector } from './indicators/orderBlockDetector'

function App() {
  // Generate sample candlestick data
  const chartData = useMemo(() => generateSampleData(200, 100), []);

  // Chart mode state
  const [useTradingViewWidget, setUseTradingViewWidget] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<string>('BTCUSD');

  // Order Block Detector state
  const [showOrderBlocks, setShowOrderBlocks] = useState<boolean>(true);
  const [obVolumePivotLength, setObVolumePivotLength] = useState<number>(5);
  const [obBullishCount, setObBullishCount] = useState<number>(3);
  const [obBearishCount, setObBearishCount] = useState<number>(3);
  const [obMitigationMethod, setObMitigationMethod] = useState<'Wick' | 'Close'>('Wick');

  // Calculate Order Block Detector indicator
  const orderBlockData = useMemo(() => {
    if (!showOrderBlocks || useTradingViewWidget) return undefined;
    return orderBlockDetector(chartData, {
      volumePivotLength: obVolumePivotLength,
      bullishOBCount: obBullishCount,
      bearishOBCount: obBearishCount,
      mitigationMethod: obMitigationMethod,
    });
  }, [chartData, showOrderBlocks, obVolumePivotLength, obBullishCount, obBearishCount, obMitigationMethod, useTradingViewWidget]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        TradingView Chart with Order Block Detector
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
        {/* Chart Mode Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          borderBottom: '2px solid #ddd',
          paddingBottom: '15px',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={useTradingViewWidget}
              onChange={(e) => setUseTradingViewWidget(e.target.checked)}
            />
            <strong>Use TradingView Advanced Chart Widget</strong>
          </label>
          {useTradingViewWidget && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Symbol:
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="BTCUSD"
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '120px',
                }}
              />
            </label>
          )}
        </div>

        {!useTradingViewWidget && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={showOrderBlocks}
                onChange={(e) => setShowOrderBlocks(e.target.checked)}
              />
              <strong>Order Block Detector [LuxAlgo]</strong>
            </label>
            {showOrderBlocks && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Volume Pivot Length:
                  <input
                    type="number"
                    value={obVolumePivotLength}
                    onChange={(e) => setObVolumePivotLength(Number(e.target.value))}
                    min="1"
                    max="20"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '70px',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Bullish OB:
                  <input
                    type="number"
                    value={obBullishCount}
                    onChange={(e) => setObBullishCount(Number(e.target.value))}
                    min="1"
                    max="10"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '70px',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Bearish OB:
                  <input
                    type="number"
                    value={obBearishCount}
                    onChange={(e) => setObBearishCount(Number(e.target.value))}
                    min="1"
                    max="10"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '70px',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Mitigation Method:
                  <select
                    value={obMitigationMethod}
                    onChange={(e) => setObMitigationMethod(e.target.value as 'Wick' | 'Close')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  >
                    <option value="Wick">Wick</option>
                    <option value="Close">Close</option>
                  </select>
                </label>
              </>
            )}
          </div>
        )}

        {useTradingViewWidget && (
          <div style={{
            padding: '10px',
            background: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107',
          }}>
            <strong>Note:</strong> TradingView Advanced Chart Widget displays real market data from TradingView.
            Custom indicators are not available in this mode. Switch back to custom chart mode to use Order Block Detector and other custom indicators.
          </div>
        )}
      </div>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <TradingViewChart
          data={chartData}
          orderBlockData={orderBlockData}
          symbol={symbol}
          useTradingViewWidget={useTradingViewWidget}
        />
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        <h3 style={{ marginTop: 0 }}>About Order Block Detector [LuxAlgo]</h3>
        <p>
          The Order Block Detector identifies potential institutional order blocks based on volume pivots and price action.
        </p>
        <ul>
          <li><strong>Bullish Order Blocks</strong> (green): Areas where institutional buyers may have placed significant orders</li>
          <li><strong>Bearish Order Blocks</strong> (red): Areas where institutional sellers may have placed significant orders</li>
          <li><strong>Average Line</strong> (gray): The midpoint of each order block</li>
          <li><strong>Mitigation</strong>: Order blocks are removed when price revisits them (based on wick or close)</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: 0 }}>
          Original Pine Script by LuxAlgo - Licensed under CC BY-NC-SA 4.0
        </p>
      </div>
    </div>
  )
}

export default App
