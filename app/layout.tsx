import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradingView Chart with Order Block Detector',
  description: 'A professional React + TypeScript application featuring TradingView\'s Charting Library with a custom Order Block Detector indicator.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
