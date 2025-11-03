# Advanced TradingView Chart Implementation

This Next.js application now features the **full TradingView Advanced Charts widget** with all professional tools and features, including the custom Order Block Detector indicator.

## Features

### Professional TradingView Chart
- **Full widget** from TradingView Charting Library (loaded via CDN)
- All drawing tools (trendlines, Fibonacci, shapes, etc.)
- 100+ built-in technical indicators
- Multiple chart types (candlestick, line, area, etc.)
- All timeframes (1m to 1M)
- Context menus and keyboard shortcuts
- Chart templates and layouts
- Professional UI/UX

### Custom Order Block Detector
- Integrated as a custom indicator using TradingView's Pine JS API
- Based on LuxAlgo's algorithm
- Configurable parameters:
  - Volume Pivot Length
  - Bullish/Bearish OB Count
  - Mitigation Method (Wick/Close)
- Visualizes bullish (green) and bearish (red) order blocks

## Usage

### Development
```bash
npm run dev
```
Visit http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## How It Works

### Component Architecture

```
app/page.tsx                                    # Main page with controls
├── TradingViewAdvancedChart.tsx                # Widget wrapper component
└── Scripts loaded dynamically:
    ├── charting_library.standalone.js          # TradingView library
    └── udf/dist/bundle.js                      # UDF datafeed adapter
```

### Data Feed

Currently using TradingView's demo datafeed:
- URL: `https://demo-feed-data.tradingview.com`
- Includes major crypto pairs
- Real-time simulation data

**Note**: A custom Binance datafeed is also available at `src/datafeed/binanceDatafeed.ts` but not currently used. To use it, you would need to integrate it with the widget configuration.

### Order Block Detector Integration

The indicator is integrated using TradingView's `custom_indicators_getter` API:

```typescript
custom_indicators_getter: function (PineJS) {
  return Promise.resolve([
    {
      name: 'Order Block Detector',
      metainfo: { /* Configuration */ },
      constructor: function () {
        this.main = function (ctx, inputCallback) {
          // Algorithm implementation
        };
      }
    }
  ]);
}
```

The indicator automatically loads when the chart is ready.

## Controls

### Top Control Panel
- **Symbol**: Change trading pair (e.g., BTCUSDT, ETHUSDT)
- **Interval**: Select timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W)
- **Theme**: Switch between light and dark themes

### Chart Controls
All TradingView controls are available:
- Left toolbar: Drawing tools
- Top toolbar: Indicators, timeframes, settings
- Bottom toolbar: Time navigation
- Right panel: Price scale

### Order Block Detector Settings
1. Click on "Order Block Detector" in the legend (top-left)
2. Click the gear icon ⚙️
3. Adjust parameters:
   - Volume Pivot Length (1-20)
   - Bullish Order Block Count (1-10)
   - Bearish Order Block Count (1-10)
   - Mitigation Method (Wick/Close)

## Keyboard Shortcuts

- **Alt + T**: Trend Line
- **Alt + H**: Horizontal Line
- **Alt + V**: Vertical Line
- **Alt + F**: Fibonacci Retracement
- **Ctrl + Z**: Undo
- **Ctrl + Y**: Redo
- **+/-**: Zoom in/out
- **←/→**: Navigate time

## Comparison with Previous Implementation

### Old Implementation (TradingViewChart.tsx)
- Lightweight Charts library
- Limited features
- Manual indicator overlay
- Basic controls

### New Implementation (TradingViewAdvancedChart.tsx)
- Full TradingView Advanced Charts
- All professional tools
- Native indicator integration
- Professional UI
- Better performance

## File Structure

```
/app
  ├── page.tsx                              # Main page (uses advanced chart)
  └── layout.tsx                            # Root layout

/src
  ├── components/
  │   ├── TradingViewAdvancedChart.tsx      # New advanced chart component ✨
  │   └── TradingViewChart.tsx              # Old lightweight chart (kept for reference)
  ├── datafeed/
  │   ├── binanceDatafeed.ts                # Custom Binance datafeed (optional)
  │   └── datafeed.ts                       # Old datafeed
  ├── studies/
  │   └── OrderBlockDetectorStudy.ts        # Old study (not used in new implementation)
  └── utils/
      └── orderBlockCalculator.ts           # Old calculator (not used in new implementation)

/public
  ├── advanced.html                         # Standalone HTML version
  ├── script.js                             # Standalone implementation
  └── ADVANCED_CHART_README.md              # Standalone documentation
```

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Mobile browsers (limited touch support)

## Troubleshooting

### Chart doesn't load
- Check browser console for errors
- Ensure internet connection (scripts load from CDN)
- Try clearing browser cache

### Indicator not showing
- Wait for chart to fully load
- Check that indicator is enabled in legend (eye icon)
- Verify Order Block Detector is in the studies list

### Performance issues
- Reduce number of indicators
- Lower data resolution
- Close other browser tabs
- Use Chrome/Edge for best performance

## Technical Notes

### Script Loading
- TradingView library loads dynamically from CDN
- Scripts are only loaded once per session
- Widget is created after scripts load

### React Integration
- Uses `useEffect` for widget lifecycle
- Proper cleanup on unmount
- Ref-based container management

### TypeScript
- Full type safety with custom declarations
- Window types for TradingView global objects

## License

This implementation uses:
- TradingView Charting Library (check their licensing terms)
- Next.js (MIT)
- React (MIT)

**Note**: TradingView Charting Library may require a license for commercial use.

## Resources

- [TradingView Charting Library Docs](https://www.tradingview.com/charting-library-docs/)
- [Custom Studies Documentation](https://www.tradingview.com/charting-library-docs/latest/custom_studies/)
- [LuxAlgo Order Blocks](https://www.luxalgo.com/)

---

**Created**: 2025-11-03
**Based on**: https://github.com/divyasshree-BQ/advanced-charts
