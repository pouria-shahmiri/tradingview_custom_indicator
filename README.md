# TradingView Advanced Chart with Custom Indicators

A React + TypeScript project built with Vite that features both TradingView's Advanced Chart widget and custom technical indicators including the Order Block Detector.

## Features

- **TradingView Advanced Chart Widget**: Toggle between custom chart and real TradingView advanced chart
  - Real-time market data from TradingView
  - Full-featured charting interface
  - Support for any trading symbol (stocks, crypto, forex, etc.)

- **Custom Indicators**: Multiple technical indicators implemented in TypeScript:
  - **Order Block Detector [LuxAlgo]**: Identifies institutional order blocks based on volume pivots
  - **Hull Suite**: Advanced moving average with three modes (HMA, EHMA, THMA)
  - **Simple Moving Average (SMA)**: Classic trend indicator

- **Order Block Detector Features**:
  - Detects bullish and bearish order blocks
  - Volume-based pivot detection
  - Configurable mitigation methods (Wick or Close)
  - Visual representation with colored zones and average lines
  - Real-time configuration adjustments

- **Dynamic Configuration**: Adjust all indicators and their parameters in real-time
- **Volume Data**: Realistic volume generation for enhanced indicator accuracy
- **Interactive Charts**: Zoom, pan, and explore price data with ease

## Project Structure

```
src/
├── components/
│   └── TradingViewChart.tsx       # Chart component with TradingView widget support
├── indicators/
│   ├── simpleMovingAverage.ts     # SMA and Hull Suite implementations
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

### Custom Indicator Mode (Default)

The application displays a candlestick chart with customizable indicators:

#### Order Block Detector [LuxAlgo]
- **Volume Pivot Length** (1-20): Sensitivity of volume pivot detection
- **Bullish/Bearish OB Count** (1-10): Number of order blocks to display
- **Mitigation Method**: Choose between Wick or Close for block invalidation

**Visual Elements**:
- Green zones: Bullish order blocks (institutional buying areas)
- Red zones: Bearish order blocks (institutional selling areas)
- Gray lines: Average price within each order block

#### Hull Suite
- **Mode**: Select HMA, EHMA, or THMA calculation method
- **Length** (2-200): Period for moving average calculation
- **Length Multiplier** (0.1-5.0): Fine-tune the indicator sensitivity

#### Simple Moving Average
- **Period** (2-200): Number of candles to average

### Chart Interaction
- Zoom in/out using mouse wheel
- Pan by clicking and dragging
- Hover over candles for detailed price information
- Toggle indicators on/off with checkboxes

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
- **Lightweight Charts 4**: High-performance charting library
- **TradingView Widget**: Professional-grade charting from TradingView

## Adding New Indicators

To add a new custom indicator:

1. Create a new function in `src/indicators/` directory:
```typescript
export function yourIndicator(
  data: CandlestickData<Time>[],
  options: YourOptions
): YourResult {
  // Your indicator logic here
  return result;
}
```

2. Import and integrate it in `App.tsx` with state management
3. Add visualization logic in `TradingViewChart.tsx`
4. Create UI controls in the settings panel

## License

This project is licensed under MIT.

The Order Block Detector indicator is based on Pine Script by LuxAlgo, licensed under CC BY-NC-SA 4.0.
