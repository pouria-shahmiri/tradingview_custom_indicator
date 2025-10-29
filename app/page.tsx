'use client'

import { useState } from 'react'
import TradingViewChart from '@/components/TradingViewChart'
import type { OrderBlockConfig } from '@/utils/orderBlockCalculator'

export default function Home() {
  // Symbol state
  const [symbol, setSymbol] = useState<string>('BTCUSDT');

  // Order Block Detector state
  const [showOrderBlocks, setShowOrderBlocks] = useState<boolean>(true);
  const [volumePivotLength, setVolumePivotLength] = useState<number>(5);
  const [bullishOBCount, setBullishOBCount] = useState<number>(3);
  const [bearishOBCount, setBearishOBCount] = useState<number>(3);
  const [mitigationMethod, setMitigationMethod] = useState<'Wick' | 'Close'>('Wick');

  const orderBlockConfig: OrderBlockConfig = {
    volumePivotLength,
    bullishOBCount,
    bearishOBCount,
    mitigationMethod,
  };

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
        background: '#000000ff',
        borderRadius: '8px',
      }}>
        {/* Symbol Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          paddingBottom: '15px',
          borderBottom: '2px solid #ddd',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>Symbol:</strong>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="BTCUSDT"
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '150px',
                fontSize: '14px',
              }}
            />
          </label>

        </div>

        {/* Order Block Detector Controls */}
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
            <strong>Show Order Block Detector</strong>
          </label>
        </div>

        {showOrderBlocks && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            paddingTop: '15px',
            borderTop: '1px solid #ddd',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Volume Pivot Length:
              <input
                type="number"
                value={volumePivotLength}
                onChange={(e) => setVolumePivotLength(Number(e.target.value))}
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
                value={bullishOBCount}
                onChange={(e) => setBullishOBCount(Number(e.target.value))}
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
                value={bearishOBCount}
                onChange={(e) => setBearishOBCount(Number(e.target.value))}
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
                value={mitigationMethod}
                onChange={(e) => setMitigationMethod(e.target.value as 'Wick' | 'Close')}
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
          symbol={symbol}
          orderBlockConfig={orderBlockConfig}
          showOrderBlocks={showOrderBlocks}
        />
      </div>


    </div>
  )
}
