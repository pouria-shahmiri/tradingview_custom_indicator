'use client'

import TradingViewAdvancedChart from '@/components/TradingViewAdvancedChart'

export default function Home() {
  return (
    <div style={{
      padding: '0',
      margin: '0',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* TradingView Chart - Full Screen */}
      <TradingViewAdvancedChart />
    </div>
  )
}
