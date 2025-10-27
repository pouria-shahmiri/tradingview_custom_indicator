# TradingView Custom Indicator

A React + TypeScript project built with Vite that integrates TradingView charts with custom technical indicators.

## Features

- **Interactive TradingView Chart**: Real-time candlestick chart visualization using lightweight-charts library
- **Custom Indicators**: Three technical indicators implemented in TypeScript:
  - Simple Moving Average (SMA)
  - Exponential Moving Average (EMA)
  - Relative Strength Index (RSI)
- **Dynamic Configuration**: Change indicators and adjust periods in real-time
- **Sample Data Generation**: Includes utility to generate realistic candlestick data for testing

## Project Structure

```
src/
├── components/
│   └── TradingViewChart.tsx    # Main chart component
├── indicators/
│   └── simpleMovingAverage.ts  # Custom indicator implementations (SMA, EMA, RSI)
├── utils/
│   └── generateSampleData.ts   # Sample data generator
├── App.tsx                      # Main application component
└── main.tsx                     # Application entry point
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

The application displays a candlestick chart with customizable technical indicators. You can:

1. **Select Indicator**: Choose between SMA, EMA, or RSI from the dropdown
2. **Adjust Period**: Modify the calculation period (2-100) using the number input
3. **Interact with Chart**:
   - Zoom in/out using mouse wheel
   - Pan by clicking and dragging
   - Hover to see detailed price information

## Custom Indicators

### Simple Moving Average (SMA)
Calculates the arithmetic mean of closing prices over a specified period. Useful for identifying price trends.

### Exponential Moving Average (EMA)
Similar to SMA but gives more weight to recent prices, making it more responsive to new information.

### Relative Strength Index (RSI)
A momentum oscillator measuring the speed and magnitude of price changes. Values range from 0-100, with readings above 70 indicating overbought conditions and below 30 indicating oversold conditions.

## Technologies

- **React 19**: UI framework
- **TypeScript 5**: Type-safe development
- **Vite 7**: Fast build tool and dev server
- **Lightweight Charts 4**: High-performance charting library

## Adding New Indicators

To add a new custom indicator:

1. Create a new function in `src/indicators/simpleMovingAverage.ts`:
```typescript
export function yourIndicator(
  data: CandlestickData<Time>[],
  period: number
): { time: Time; value: number }[] {
  // Your indicator logic here
}
```

2. Import and add it to the indicator selector in `App.tsx`

## License

MIT
