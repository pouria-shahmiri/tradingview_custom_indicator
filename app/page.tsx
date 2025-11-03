'use client'

import { useState } from 'react'
import TradingViewAdvancedChart from '@/components/TradingViewAdvancedChart'

export default function Home() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('1D');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div style={{
      padding: '0',
      margin: '0',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: theme === 'dark' ? '#131722' : '#ffffff'
    }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '14px' }}>Symbol:</strong>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTCUSDT"
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '120px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '14px' }}>Interval:</strong>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          >
            <option value="1">1m</option>
            <option value="5">5m</option>
            <option value="15">15m</option>
            <option value="30">30m</option>
            <option value="60">1h</option>
            <option value="240">4h</option>
            <option value="1D">1D</option>
            <option value="1W">1W</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '14px' }}>Theme:</strong>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div style={{
          fontSize: '12px',
          color: '#666',
          borderLeft: '2px solid #ddd',
          paddingLeft: '15px',
        }}>
          Advanced TradingView Chart with Order Block Detector
        </div>
      </div>

      {/* TradingView Chart */}
      <TradingViewAdvancedChart
        symbol={symbol}
        interval={interval}
        theme={theme}
      />
    </div>
  )
}
