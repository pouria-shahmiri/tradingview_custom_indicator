# TradingView Chart with Order Block Detector

A professional React + TypeScript application featuring TradingView's Charting Library with a custom Order Block Detector indicator. This project uses the commercial TradingView Charting Library with full drawing tools, indicators, and real-time market data.

## Features

- **TradingView Charting Library**: Professional-grade charting with full feature set
  - Complete suite of drawing tools (lines, shapes, Fibonacci, etc.)
  - Real-time market data from Binance
  - Multiple timeframes and chart types
  - Volume indicator
  - All professional charting features

- **Order Block Detector [LuxAlgo]**: Custom technical indicator
  - Identifies institutional order blocks based on volume pivots
  - Detects bullish and bearish order blocks
  - Volume-based pivot detection
  - Configurable mitigation methods (Wick or Close)
  - Visual representation with colored zones and average lines
  - Real-time configuration adjustments

## Prerequisites

**IMPORTANT**: This project requires a valid TradingView Charting Library license.

If you don't have a license, visit: https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tradingview_custom_indicator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup TradingView Charting Library

Follow the detailed instructions in [CHARTING_LIBRARY_SETUP.md](./CHARTING_LIBRARY_SETUP.md)

**Quick Summary:**
1. Download the Charting Library from TradingView (requires license)
2. Extract it to `public/charting_library/`
3. The final structure should be:
   ```
   public/
   └── charting_library/
       ├── charting_library/
       │   └── charting_library.js
       ├── datafeeds/
       └── static/
   ```

### 4. Run the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── TradingViewChart.tsx       # Main chart component with Charting Library
├── datafeed/
│   └── datafeed.ts                # Custom datafeed for Binance data
├── studies/
│   └── OrderBlockDetectorStudy.ts # Custom study definition (advanced)
├── utils/
│   └── orderBlockCalculator.ts    # Order block calculation logic
├── App.tsx                         # Main application component
└── main.tsx                        # Application entry point
```

## Usage

### Chart Controls

1. **Symbol Selection**: Enter any Binance trading pair (e.g., BTCUSDT, ETHUSDT, BNBUSDT)
2. **Order Block Detector**: Toggle the indicator on/off
3. **Drawing Tools**: Use TradingView's full suite of drawing tools from the sidebar
4. **Timeframes**: Change timeframes using the top toolbar
5. **Indicators**: Add additional TradingView indicators from the menu

### Order Block Detector Settings

- **Volume Pivot Length** (1-20): Sensitivity of volume pivot detection
- **Bullish OB Count** (1-10): Number of bullish order blocks to display
- **Bearish OB Count** (1-10): Number of bearish order blocks to display
- **Mitigation Method**: Choose between Wick or Close for block invalidation

### Visual Elements

- **Green Boxes**: Bullish order blocks (institutional buying areas)
- **Red Boxes**: Bearish order blocks (institutional selling areas)
- **Gray Dashed Lines**: Average price within each order block

## Order Block Theory

Order blocks represent areas where large institutional players have placed significant orders. These zones often act as support/resistance levels:

- **Bullish Order Blocks**: Form during uptrends where institutions accumulate positions
- **Bearish Order Blocks**: Form during downtrends where institutions distribute positions
- **Mitigation**: When price returns to an order block, it's considered "mitigated" and removed

The indicator uses volume pivots to identify these areas, making it more reliable than pure price-based methods.

## Technologies

- **React 19**: Modern UI framework
- **TypeScript 5**: Type-safe development
- **Vite 7**: Lightning-fast build tool and dev server
- **TradingView Charting Library**: Professional-grade charting (commercial license required)
- **Binance API**: Real-time cryptocurrency market data

## Data Source

The application uses Binance's public API to fetch real-time cryptocurrency data. No API key is required for basic market data access.

## Development

### Adding Custom Indicators

The Order Block Detector is implemented using:
1. **Calculation Logic**: `src/utils/orderBlockCalculator.ts`
2. **Visualization**: Drawing API in `src/components/TradingViewChart.tsx`

To add your own custom indicators:
1. Create calculation logic in `src/utils/`
2. Draw shapes on the chart using TradingView's Drawing API
3. Update controls in `App.tsx`

### Modifying the Datafeed

To connect to a different data source:
1. Edit `src/datafeed/datafeed.ts`
2. Implement the required datafeed methods
3. See [TradingView Datafeed API docs](https://www.tradingview.com/charting-library-docs/latest/connecting_data/)

## Troubleshooting

### "TradingView library not loaded" Error

1. Verify `public/charting_library/` exists with all files
2. Check the script tag in `index.html`
3. Clear browser cache and rebuild

### Order Blocks Not Appearing

1. Check browser console for errors
2. Ensure symbol has volume data
3. Try adjusting Volume Pivot Length
4. Wait for sufficient data to load

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

## License

This project is licensed under MIT.

The Order Block Detector indicator is based on Pine Script by LuxAlgo, licensed under CC BY-NC-SA 4.0.

**Note**: TradingView Charting Library requires a separate commercial license from TradingView.

## Credits

- **Order Block Detector Algorithm**: Based on LuxAlgo's Pine Script implementation
- **Charting Library**: TradingView
- **Market Data**: Binance API

## Support

For issues related to:
- **This project**: Open an issue on GitHub
- **TradingView Charting Library**: Contact TradingView support
- **Binance API**: See [Binance API documentation](https://binance-docs.github.io/apidocs/)
