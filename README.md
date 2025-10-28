# TradingView Chart with Order Block Detector

A React + TypeScript project built with Vite that features both a custom chart with Order Block Detector indicator and TradingView's Advanced Chart widget with drawing tools.

## Features

- **Two Chart Modes**:
  - **Custom Chart**: Lightweight chart with Order Block Detector indicator
  - **TradingView Advanced Chart Widget**: Professional-grade chart with drawing tools and real-time market data
    - Full drawing toolkit (lines, shapes, annotations)
    - Real-time market data from TradingView
    - Support for any trading symbol (stocks, crypto, forex, etc.)

- **Order Block Detector [LuxAlgo]**: Custom technical indicator for the custom chart mode
  - Identifies institutional order blocks based on volume pivots
  - Detects bullish and bearish order blocks
  - Volume-based pivot detection
  - Configurable mitigation methods (Wick or Close)
  - Visual representation with colored zones and average lines
  - Real-time configuration adjustments

## Project Structure

```
src/
├── components/
│   └── TradingViewChart.tsx       # Chart component with TradingView widget support
├── indicators/
│   └── orderBlockDetector.ts      # Order Block Detector implementation
├── utils/
│   └── generateSampleData.ts      # Sample data generator with volume
├── App.tsx                         # Main application component
└── main.tsx                        # Application entry point
```

## Installation

```bash
npm install
```

## Running the Project

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### TradingView Advanced Chart Mode

1. Enable "Use TradingView Advanced Chart Widget" checkbox
2. Enter a trading symbol (e.g., BTCUSD, AAPL, EURUSD)
3. Explore real market data with TradingView's full charting interface
4. Use the built-in drawing tools (lines, shapes, Fibonacci, etc.)
5. Apply technical analysis with TradingView's extensive library of indicators

### Custom Chart Mode (Default)

The application displays a candlestick chart with the Order Block Detector indicator:

#### Order Block Detector [LuxAlgo]
- **Volume Pivot Length** (1-20): Sensitivity of volume pivot detection
- **Bullish OB Count** (1-10): Number of bullish order blocks to display
- **Bearish OB Count** (1-10): Number of bearish order blocks to display
- **Mitigation Method**: Choose between Wick or Close for block invalidation

**Visual Elements**:
- Green zones: Bullish order blocks (institutional buying areas)
- Red zones: Bearish order blocks (institutional selling areas)
- Gray lines: Average price within each order block

### Chart Interaction
- **Custom Chart Mode**:
  - Zoom in/out using mouse wheel
  - Pan by clicking and dragging
  - Hover over candles for detailed price information
  - Toggle Order Block Detector on/off with checkbox

- **TradingView Advanced Chart Mode**:
  - Full suite of drawing tools
  - Multiple timeframes
  - Professional charting features

## Order Block Detector Theory

Order blocks represent areas where large institutional players have placed significant orders. These zones often act as support/resistance levels:

- **Bullish Order Blocks**: Form during uptrends where institutions accumulate positions
- **Bearish Order Blocks**: Form during downtrends where institutions distribute positions
- **Mitigation**: When price returns to an order block, it's considered "mitigated" and removed

The indicator uses volume pivots to identify these areas, making it more reliable than pure price-based methods.

## Technologies

- **React 19**: Modern UI framework
- **TypeScript 5**: Type-safe development
- **Vite 7**: Lightning-fast build tool and dev server
- **Lightweight Charts 4**: High-performance charting library (used in custom chart mode)
- **TradingView Widget**: Professional-grade charting with drawing tools (advanced mode)

## License

This project is licensed under MIT.

The Order Block Detector indicator is based on Pine Script by LuxAlgo, licensed under CC BY-NC-SA 4.0.
