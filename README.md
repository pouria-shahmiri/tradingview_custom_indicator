# TradingView Chart with Order Block Detector

A professional application featuring TradingView's Charting Library with a custom Order Block Detector indicator. This project provides two implementations:

1. **Standalone HTML/JS** (`public/`): Clean implementation using TradingView's custom indicators API
2. **Next.js + React** (`app/` and `src/`): Full-featured React application with Lightweight Charts

Both implementations include the Order Block Detector algorithm based on LuxAlgo's indicator.

## Features

### Order Block Detector [LuxAlgo]
- Identifies institutional order blocks based on volume pivots
- Detects bullish and bearish order blocks
- Volume-based pivot detection
- Configurable mitigation methods (Wick or Close)
- Visual representation with colored lines and zones
- Real-time configuration adjustments

### Two Implementations

#### 1. Standalone HTML/JS (`public/` directory)
- ✅ Clean, simple structure inspired by TradingView examples
- ✅ Uses TradingView Charting Library's `custom_indicators_getter` API
- ✅ Order Block indicator as a native TradingView custom study
- ✅ No build tools required - just open `index.html`
- ✅ Easy to understand and modify
- 📁 See `public/README.md` for details

#### 2. Next.js + React (`app/` and `src/` directories)
- ✅ Full-featured React application with TypeScript
- ✅ Uses Lightweight Charts library
- ✅ Custom overlay drawing for order blocks
- ✅ Interactive controls panel
- ✅ Modern Next.js 15 with App Router
- ✅ Server-side rendering support
- 📁 Previous implementation with advanced features

## Quick Start

### Option 1: Standalone HTML/JS (Recommended for Beginners)

1. Navigate to the `public/` directory
2. Open `index.html` in your web browser
3. The chart loads automatically with the Order Block Detector

No installation or build process required! See `public/README.md` for more details.

### Option 2: Next.js + React (Advanced)

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd tradingview_custom_indicator
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open the Application**
   - Next.js app: http://localhost:3000
   - Standalone HTML: http://localhost:3000/index.html

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
public/                             # ⭐ Standalone HTML/JS Implementation
├── index.html                      # Clean HTML structure
├── script.js                       # TradingView widget + Order Block indicator
└── README.md                       # Standalone implementation docs

app/                                # Next.js App Router
├── layout.tsx                      # Root layout with metadata
├── page.tsx                        # Home page (React implementation)
└── globals.css                     # Global styles

src/                                # React Implementation
├── components/
│   └── TradingViewChart.tsx       # Chart component with Lightweight Charts
├── datafeed/
│   └── datafeed.ts                # Custom datafeed for Binance data
├── studies/
│   └── OrderBlockDetectorStudy.ts # Custom study definition
└── utils/
    └── orderBlockCalculator.ts    # Order block calculation logic
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

- **Next.js 15**: Modern React framework with App Router
- **React 19**: Modern UI framework
- **TypeScript 5**: Type-safe development
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
3. Update controls in `app/page.tsx`

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

# Clear Next.js cache
rm -rf .next
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
