# Advanced TradingView Chart with Order Block Detector

This is a professional-grade TradingView charting implementation with ALL advanced features enabled, including your custom Order Block Detector indicator.

## Features

### 🎯 Custom Indicator
- **Order Block Detector** - Based on LuxAlgo's algorithm
  - Detects institutional order blocks (support/resistance zones)
  - Configurable parameters via TradingView UI
  - Visual representation with green (bullish) and red (bearish) zones

### 📊 Advanced Chart Features

#### Drawing Tools
All TradingView drawing tools are available on the left toolbar:
- Trend Lines
- Horizontal Lines
- Vertical Lines
- Fibonacci Retracement
- Fibonacci Extensions
- Gann Fan
- Rectangle
- Ellipse
- Triangle
- Brush
- Price Range
- Text & Notes
- Callouts
- Long/Short Positions
- And many more...

#### Technical Indicators
Access 100+ built-in indicators:
- Moving Averages (SMA, EMA, WMA)
- RSI (Relative Strength Index)
- MACD
- Bollinger Bands
- Stochastic
- Volume indicators
- And your custom Order Block Detector

#### Timeframes
All standard timeframes available:
- Seconds: 1s, 5s, 10s, 15s, 30s
- Minutes: 1m, 3m, 5m, 15m, 30m, 45m
- Hours: 1H, 2H, 3H, 4H
- Days: 1D, 3D
- Weeks: 1W
- Months: 1M

#### Chart Types
- Candlestick (default)
- Bars
- Line
- Area
- Heikin Ashi
- Hollow Candles
- Baseline
- Hi-Lo

#### Additional Features
- Volume indicator (enabled by default)
- Price scale customization
- Grid customization
- Background colors
- Watermark
- Legend
- Context menus
- Keyboard shortcuts
- Chart templates
- Object tree
- Multiple panes
- Alerts
- Screenshot/Export

## Usage

### Quick Start

1. **Open the chart:**
   ```bash
   # Simply open advanced.html in your browser
   open public/advanced.html
   ```

   Or if running the Next.js dev server:
   ```bash
   npm run dev
   # Visit http://localhost:3000/advanced.html
   ```

2. **The chart will load with:**
   - Default symbol: BTCUSDT
   - Default interval: 1D
   - Volume indicator: Enabled
   - Order Block Detector: Active

### Using the Order Block Detector

The Order Block Detector is automatically loaded when the chart starts. You'll see:

- **Green horizontal lines**: Bullish order blocks (support levels)
- **Red horizontal lines**: Bearish order blocks (resistance levels)
- **Gray dashed lines**: Average price within the blocks

#### Configuring the Indicator

1. Click on the indicator name in the top-left legend
2. Click the gear icon ⚙️ to open settings
3. Adjust parameters:
   - **Volume Pivot Length** (1-20): Length for volume pivot detection
   - **Bullish Order Block Count** (1-10): How many bullish blocks to show
   - **Bearish Order Block Count** (1-10): How many bearish blocks to show
   - **Mitigation Method**: "Wick" or "Close"

#### Understanding the Indicator

**How it works:**
1. Detects volume spikes (pivots)
2. Identifies order blocks based on market structure
3. Shows zones where institutions likely placed orders
4. Removes (mitigates) blocks when price breaks through

**Trading with Order Blocks:**
- **Bullish blocks (green)**: Look for bounce opportunities (support)
- **Bearish blocks (red)**: Look for rejection opportunities (resistance)
- **Mitigation**: When price breaks a block, it's no longer valid

### Using Drawing Tools

1. **Access toolbar**: Left side of the chart
2. **Select a tool**: Click on any drawing tool icon
3. **Draw on chart**: Click/drag on the chart to create drawings
4. **Modify**: Right-click on any drawing to edit, clone, or delete
5. **Lock/Unlock**: Lock drawings to prevent accidental changes

### Adding More Indicators

1. Click the "Indicators" button (top toolbar)
2. Search for any indicator (RSI, MACD, etc.)
3. Click to add it to the chart
4. Configure via settings

### Keyboard Shortcuts

- **Alt + T**: Trend Line
- **Alt + H**: Horizontal Line
- **Alt + V**: Vertical Line
- **Alt + F**: Fibonacci Retracement
- **Alt + W**: Add Alert
- **Ctrl + S**: Take Screenshot
- **Ctrl + Z**: Undo
- **Ctrl + Y**: Redo
- **+/-**: Zoom in/out
- **←/→**: Navigate backward/forward in time

## Technical Details

### Architecture

```
advanced.html          # Main HTML file with styling
script.js              # Widget configuration + custom indicator
TradingView Library    # Loaded via CDN
UDF Datafeed           # Demo data feed
```

### Widget Configuration

```javascript
{
  fullscreen: true,
  symbol: "BTCUSDT",
  interval: "1D",
  theme: "light",

  // 30+ features enabled
  enabled_features: [
    "study_templates",
    "side_toolbar_in_fullscreen_mode",
    "header_in_fullscreen_mode",
    "trading_options",
    "create_volume_indicator_by_default",
    "timeframes_toolbar",
    "edit_buttons_in_legend",
    "context_menus",
    // ... and many more
  ],

  // Minimal restrictions
  disabled_features: [
    "header_saveload",      // Cloud save (requires API)
    "use_localstorage_for_settings", // Duplicate
    "go_to_date",          // Date picker
  ]
}
```

### Custom Indicator Integration

The Order Block Detector is integrated using TradingView's `custom_indicators_getter` API:

```javascript
custom_indicators_getter: function (PineJS) {
  return Promise.resolve([{
    name: "Order Block Detector",
    metainfo: { /* Configuration */ },
    constructor: function () {
      this.main = function (ctx, inputCallback) {
        // Algorithm implementation
      };
    }
  }]);
}
```

## Data Feed

Currently using TradingView's demo feed:
- URL: `https://demo-feed-data.tradingview.com`
- Includes major crypto pairs
- Real-time simulation data
- No API key required

### Switching to Real Data

To use real data, replace the datafeed:

```javascript
datafeed: new Datafeeds.UDFCompatibleDatafeed(
  "YOUR_DATAFEED_URL"
)
```

Popular options:
- Binance API
- Coinbase Pro API
- Your own backend datafeed
- Third-party datafeed services

## Customization

### Changing Default Symbol

Edit `script.js`:
```javascript
symbol: "ETHUSDT",  // Change from BTCUSDT
```

### Changing Theme

```javascript
theme: "dark",  // "light" or "dark"
```

### Adding More Custom Indicators

Add to the `custom_indicators_getter` array:
```javascript
return Promise.resolve([
  { name: "Order Block Detector", /* ... */ },
  { name: "Your New Indicator", /* ... */ }
]);
```

### Modifying Colors

Update the `overrides` object:
```javascript
overrides: {
  "mainSeriesProperties.candleStyle.upColor": "#26a69a",
  "mainSeriesProperties.candleStyle.downColor": "#ef5350",
  // Add more customizations
}
```

## Troubleshooting

### Chart doesn't load
- Check browser console for errors
- Ensure you have internet connection (libraries load from CDN)
- Try clearing browser cache
- Check that script.js is in the same directory

### Indicator not showing
- Wait for chart to fully load
- Check browser console for "Order Block Detector initialized successfully!"
- Verify the indicator is enabled in the legend (eye icon)

### Drawing tools not working
- Ensure you've selected a tool from the left toolbar
- Check that the chart is not locked
- Try refreshing the page

### Performance issues
- Reduce the number of indicators
- Lower the data resolution
- Close other browser tabs
- Use a modern browser (Chrome, Edge, Firefox)

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Mobile browsers (limited touch support)

## File Structure

```
public/
├── advanced.html              # Advanced chart interface
├── script.js                  # Widget + indicator logic
├── index.html                 # Simple version
├── ADVANCED_CHART_README.md   # This file
└── README.md                  # Simple version docs
```

## Comparison: Simple vs Advanced

| Feature | Simple (index.html) | Advanced (advanced.html) |
|---------|-------------------|------------------------|
| Order Block Detector | ✅ | ✅ |
| Volume Indicator | ❌ | ✅ |
| Drawing Tools | ✅ | ✅ |
| Technical Indicators | ✅ | ✅ |
| UI Enhancements | Basic | Professional |
| Timeframes Toolbar | ❌ | ✅ |
| Context Menus | ❌ | ✅ |
| Chart Templates | ❌ | ✅ |
| Object Tree | ❌ | ✅ |
| Countdown | ❌ | ✅ |

## Examples

### Buy Signal Example
1. Price approaches a **green** (bullish) order block
2. Wait for confirmation (candlestick pattern, volume)
3. Enter long position
4. Stop loss below the order block
5. Take profit at next resistance or bearish order block

### Sell Signal Example
1. Price approaches a **red** (bearish) order block
2. Wait for confirmation
3. Enter short position
4. Stop loss above the order block
5. Take profit at next support or bullish order block

## Resources

- [TradingView Charting Library Docs](https://www.tradingview.com/charting-library-docs/)
- [LuxAlgo Order Blocks Explanation](https://www.luxalgo.com/)
- [Order Block Trading Guide](https://www.investopedia.com/)

## Credits

- **Order Block Algorithm**: Based on LuxAlgo's Pine Script implementation
- **Charting Library**: TradingView Charting Library
- **Data Feed**: TradingView UDF Compatible Datafeed

## License

This is a custom implementation. Check TradingView's licensing terms for commercial use of the Charting Library.

---

**Note**: This is demo/educational software. Always do your own research and use proper risk management when trading.
